---
baseline_commit: be58911fc9a23fabbe5ce17a37ac6150168c35f9
---

# Story 3.5: Relance automatique en cas de non-lecture d'un message prioritaire

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a organisateur,
I want une seconde notification renforcée si aucun de nous deux n'a ouvert une conversation prioritaire dans les 4 heures,
so that un message grave n'est jamais silencieusement oublié.

## ⚠️ Décision de Charles (2026-07-16) : cron Vercel natif 1x/jour, délai réel jusqu'à ~28h dans le pire cas

Recherche effectuée pendant la création de cette story : le plan Vercel Hobby (gratuit, verrouillé par AD-10) **limite les Cron Jobs à une exécution par jour maximum** — une expression plus fréquente (`*/15 * * * *`, `0 * * * *`, etc.) est **rejetée au déploiement**. Sur Hobby, l'heure exacte d'exécution dans l'heure choisie n'est pas garantie non plus (ex. `0 6 * * *` peut se déclencher n'importe quand entre 06:00:00 et 06:59:59).

Charles a tranché explicitement (voir Change Log) : **rester sur le cron natif Vercel, une fois par jour**, plutôt que d'ajouter un service externe (ex. cron-job.org appelant une route toutes les 15-30 min) ou de passer sur un plan Vercel payant. Conséquence assumée : le seuil "4h" de l'AC ci-dessous reste le critère d'**éligibilité** d'une conversation à la relance (toujours vérifié précisément, `now() - dernier message élève >= 4h`), mais la **fréquence d'exécution** de la tâche qui vérifie ce critère est quotidienne — donc une conversation qui devient éligible juste après le passage du cron du jour peut attendre jusqu'à ~24h + quelques minutes avant la prochaine vérification (~28h au total depuis le message initial dans le pire cas), plutôt que ~4h pile. Ne pas tenter de contourner cette limite Hobby dans le code (aucune boucle `setInterval`/polling côté serveur — Vercel Functions sont sans état persistant entre invocations, et un tel contournement violerait l'esprit d'AD-10). Si Charles souhaite un jour un délai plus proche de 4h, ce sera une nouvelle décision explicite (service externe ou upgrade payant), pas quelque chose à réintroduire silencieusement ici.

## Acceptance Criteria

1. **Given** une Conversation marquée prioritaire (`is_priority = true`) dont le dernier message de type `eleve` a été envoyé il y a au moins 4 heures, et dont `last_organizer_read_at` est `null` ou antérieur à ce dernier message (donc "non traitée" au sens de la définition Lu/non-lu du Spine — même définition que Story 3.2), **When** la tâche planifiée s'exécute, **Then** une seconde notification part vers les **mêmes deux** `chat_id` Telegram simultanément, avec le même texte "prioritaire" que la notification initiale (réutilisation directe de `notifierNouveauMessage(conversationId, true)`, Story 3.4 — voir Dev Notes, aucune nouvelle fonction Telegram ni nouveau format de texte). [Source: epics.md#Story-3.5; ARCHITECTURE-SPINE.md#AD-7 "La relance FR-15 renvoie le même message aux deux"]
2. **Given** une Conversation prioritaire déjà **lue** par un Organisateur (`last_organizer_read_at` postérieur au dernier message `eleve`) au moment où la tâche planifiée s'exécute, **When** la tâche s'exécute, **Then** aucune relance n'est envoyée pour cette Conversation — la définition "non traitée" (Spine, section Lu/non-lu) est l'unique critère de lecture, pas une colonne dédiée. [Source: ARCHITECTURE-SPINE.md, section "Lu/non-lu (FR-5, FR-15)"]
3. **Given** une Conversation non marquée prioritaire (`is_priority = false`), même non traitée depuis très longtemps, **When** la tâche planifiée s'exécute, **Then** elle n'est jamais concernée par cette story — FR-15 ne s'applique qu'aux Conversations prioritaires, ce n'est pas une relance générique pour tout message en attente. [Edge case — nécessaire pour ne pas transformer FR-15 en rappel généralisé, hors périmètre de l'epic]
4. **Given** une Conversation déjà relancée une première fois pour son message `eleve` non lu actuel (`relance_envoyee_at` renseigné et postérieur ou égal à ce dernier message), **When** la tâche planifiée s'exécute à nouveau (le lendemain, toujours non lue), **Then** aucune seconde relance n'est renvoyée pour ce même message — l'AC de l'epic dit explicitement "**une** seconde notification", pas un rappel quotidien répété. **Sauf si** un **nouveau** message `eleve` arrive ensuite dans cette même Conversation (toujours non lu 4h plus tard) : dans ce cas la comparaison se refait contre ce nouveau message et une nouvelle relance redevient possible. [Source: epics.md#Story-3.5, "une seconde notification" (singulier); nécessaire pour éviter un spam Telegram quotidien tant qu'une Conversation grave reste ouverte]
5. **Given** une requête HTTP vers la route de la tâche planifiée **sans** en-tête `Authorization: Bearer <CRON_SECRET>` valide, **When** la requête arrive, **Then** elle est rejetée (401), sans exécuter aucune requête Supabase ni envoyer aucune notification — cette route est un point d'entrée public par nature (Vercel y fait un GET HTTP), elle doit donc s'authentifier elle-même comme n'importe quelle Server Action (AD-3), même si ce n'est pas une Server Action mais une Route Handler (seule exception déjà actée par AD-3 pour un mécanisme sortant ; ce cron est un mécanisme **entrant** distinct, prévu explicitement par le Spine — voir Structural Seed — donc pas une violation de "aucune route API custom"). [Source: ARCHITECTURE-SPINE.md#AD-3; Vercel docs, pattern officiel `CRON_SECRET`]
6. **Given** plusieurs Conversations éligibles à la relance lors d'une même exécution, et que l'envoi Telegram ou la mise à jour `relance_envoyee_at` échoue pour l'une d'elles (réseau, Telegram indisponible, erreur Supabase), **When** l'échec survient, **Then** les autres Conversations éligibles sont quand même traitées indépendamment (pas d'échec groupé) et l'échec est journalisé en métadonnées seulement (jamais de contenu de message) — même philosophie que `Promise.allSettled` sur les `chat_id` en Story 3.4, étendue ici au niveau "une Conversation à la fois". [Edge case dérivé de NFR-2 / Consistency Conventions > Logs & confidentialité]

## Tasks / Subtasks

- [x] Task 1 (préalable, hors code) : Provisionner `CRON_SECRET` — action manuelle de Charles, bloquante pour la vérification (AC #5)
  - [x] Générer une chaîne aléatoire d'au moins 16 caractères (ex. générateur de mot de passe) pour `CRON_SECRET`
  - [x] Ajouter `CRON_SECRET` (valeur réelle) dans `.env.local` (jamais commité) pour les tests locaux
  - [ ] Ajouter `CRON_SECRET` (même valeur) dans les Environment Variables du projet Vercel (Production) — **bloqué dans cette session** (écriture de secret en production refusée par le mode automatique de l'agent, action volontairement laissée à Charles, voir Debug Log) — sans cette étape, Vercel Cron enverra bien l'en-tête `Authorization` automatiquement en production, mais la route le refusera (comportement fail-closed voulu, pas un bug) tant que la variable n'est pas définie côté Vercel
  - [x] Documenter `CRON_SECRET` dans `.env.local.example` (vide, avec commentaire explicatif), même format que les entrées `TELEGRAM_*` existantes

- [x] Task 2 : Migration — nouvelle colonne `relance_envoyee_at` (AC: #1, #4)
  - [x] Nouveau fichier `supabase/migrations/20260716000000_relance_envoyee_at.sql` : `alter table conversations add column if not exists relance_envoyee_at timestamptz;` (nullable — `null` signifie "jamais relancée", même convention que `last_organizer_read_at`)
  - [x] Aucune autre modification de schéma nécessaire — `is_priority`, `last_organizer_read_at`, `created_at` existent déjà (migration `20260708000000_conversations_and_messages.sql`)
  - [x] Appliquée sur le projet Supabase (`supabase db push --linked`), colonne vérifiée requêtable via l'API REST (`GET /rest/v1/conversations?select=relance_envoyee_at` → 200)

- [x] Task 3 : `lib/relance.ts` — nouveau module, logique d'éligibilité et d'envoi (AC: #1, #2, #3, #4, #6)
  - [x] Exporte `envoyerRelancesEnRetard(): Promise<{ relancesEnvoyees: number }>`
  - [x] Requête 1 : conversations prioritaires uniquement (`is_priority = true`), pas de couplage avec `chargerConversations` (UI)
  - [x] Requête 2 : messages élève des conversations prioritaires + calcul du dernier message élève par conversation via `Map`, même pattern que `app/organisateurs/page.tsx`
  - [x] Échec de requête Supabase → log métadonnées + retour `{ relancesEnvoyees: 0 }`, jamais de throw
  - [x] Éligibilité calculée exactement selon la formule spécifiée (non traitée + pas déjà relancée pour ce message + ≥4h)
  - [x] Traitement par conversation via `Promise.allSettled` (notification + mise à jour `relance_envoyee_at`), échec isolé journalisé sans bloquer les autres
  - [x] Retourne le nombre de relances effectivement envoyées

- [x] Task 4 : `app/api/cron/relance/route.ts` — nouvelle Route Handler (AC: #5)
  - [x] `GET` vérifiant l'en-tête `Authorization: Bearer <CRON_SECRET>` (pattern officiel Vercel, reproduit tel quel) → 401 si absent/incorrect
  - [x] Appelle `envoyerRelancesEnRetard()` et retourne `Response.json({ success: true, relancesEnvoyees })`
  - [x] Aucune donnée sensible dans la réponse

- [x] Task 5 : Déclarer le Cron Job dans `vercel.json` (AC: #1)
  - [x] `vercel.json` créé à la racine avec `{ "path": "/api/cron/relance", "schedule": "0 6 * * *" }`
  - [x] Schedule quotidien à 06:00 UTC (imprécis sur Hobby, voir callout) — ajustable sans autre impact
  - [x] Le cron ne prendra effet qu'après le prochain push sur `main` (AD-10) — pas encore déployé dans cette session (voir Debug Log)

- [x] Task 6 : Vérification manuelle (AC: #1 à #6)
  - [x] `npm run lint` (0 erreur) et `npm run build` (succès, route `/api/cron/relance` générée) passent
  - [x] Test local sans en-tête `Authorization` → `401` confirmé (AC #5)
  - [x] Test avec un mauvais secret (`Bearer mauvais-secret`) → `401` confirmé également
  - [x] Test avec le bon secret et aucune Conversation éligible → `200`, `{"success":true,"relancesEnvoyees":0}`
  - [x] Conversation de test réellement éligible (`is_priority=true`, message `eleve` avec `created_at` reculé de 5h via l'API REST Supabase, `last_organizer_read_at`/`relance_envoyee_at` `null`) → appel de la route → `relancesEnvoyees: 1`, aucune erreur journalisée (envoi Telegram réussi, même chemin de code que Story 3.4 déjà vérifiée en conditions réelles), `relance_envoyee_at` confirmé renseigné en base par relecture immédiate
  - [x] Ré-appel immédiat de la route sur la même Conversation → `relancesEnvoyees: 0` (AC #4, idempotence confirmée)
  - [x] Conversation de test prioritaire mais déjà lue (`last_organizer_read_at` postérieur au message `eleve` de test) → non relancée (AC #2, `relancesEnvoyees: 0` sur cet appel)
  - [x] Conversation de test non prioritaire (`is_priority=false`) avec message vieux de 10h → non relancée (AC #3, même appel que ci-dessus)
  - [x] Toutes les données de test (3 conversations + messages) supprimées après vérification ; requête finale de contrôle confirmant `[]` résultat pour toute trace résiduelle
  - [x] **Limite connue, documentée dans `deferred-work.md`** : le déclenchement réel par Vercel Cron en production ne peut être confirmé qu'après déploiement (`vercel.json` pas encore poussé sur `main`) et provisionnement de `CRON_SECRET` côté Vercel (bloqué dans cette session, voir Task 1 et Debug Log) — la vérification de cette story couvre la logique de la route et de `lib/relance.ts`, pas l'infrastructure de scheduling elle-même

## Dev Notes

- **Ne pas toucher `lib/telegram.ts`** : la revue de code de la Story 3.4 a explicitement anticipé cette story et conclu que `notifierNouveauMessage(conversationId, estPrioritaire)` est directement réutilisable pour la relance, sans modification ni nouvelle signature — "le Spine d'architecture (AD-7) précise explicitement que la relance renvoie le **même message**, donc la signature actuelle (`boolean`) suffit déjà sans refactor" (voir `3-4-...md`, Review Findings). Appeler `notifierNouveauMessage(conversationId, true)` directement depuis `lib/relance.ts` — c'est la totalité de l'intégration Telegram requise pour cette story.
- **Un seul mécanisme de notification, encore une fois (AD-7)** : ne pas créer un texte "relance" différent du texte "prioritaire" existant. AD-7 est explicite : "La relance FR-15 renvoie le même message aux deux". Toute tentation d'ajouter une variante de texte ("⚠️ RELANCE — ...") serait un chemin de code supplémentaire non prévu par le Spine.
- **Pourquoi `relance_envoyee_at` (nouvelle colonne) plutôt qu'un simple test "already sent"** : l'ER diagram du Spine est décrit comme figé ("noms + relations seulement"), mais chaque story a jusqu'ici ajouté les colonnes dont elle avait concrètement besoin (`flagged_missed_danger` anticipé en Story 2.2, `recovery_attempts` créée en Story 1.5) — cette story suit le même principe. Sans cette colonne, la tâche planifiée renverrait une notification à **chaque** exécution quotidienne tant que la Conversation reste non lue, ce qui contredit le texte de l'AC de l'epic ("**une** seconde notification", singulier) et transformerait la relance en spam Telegram quotidien. La comparaison `relance_envoyee_at < dernierMessageEleve` (plutôt qu'un simple booléen) permet nativement qu'**un nouveau** message élève dans la même Conversation redevienne éligible à une nouvelle relance après 4h, sans logique de reset explicite à écrire — même mécanisme que `last_organizer_read_at` pour "non traitée" (Spine, section Lu/non-lu).
- **Pattern de calcul "dernier message élève par conversation" déjà établi (Story 3.2)** : `app/organisateurs/page.tsx`, fonction `chargerConversations` (lignes ~32-150), calcule déjà exactement cette donnée pour l'UI (badge "Non traitée"). `lib/relance.ts` reproduit le même calcul (deux requêtes + `Map` en JS) mais sur un périmètre différent (uniquement `is_priority = true`, pas toutes les Conversations) et pour un usage différent (déclenchement de notification, pas affichage). Ne pas essayer de faire de `chargerConversations` une fonction partagée entre l'UI Organisateurs et ce cron : formes de retour et gestion d'erreur différentes (l'UI a besoin de tri/formatage d'affichage, le cron n'en a aucun besoin) — dupliquer ce calcul ciblé est plus simple à lire que d'introniser une abstraction commune pour deux appelants aux besoins distincts (NFR-1).
- **Cron Job Vercel = Route Handler standard, déclenché par un GET HTTP** : Vercel fait un GET vers le `path` déclaré dans `vercel.json`, avec un header `User-Agent: vercel-cron/1.0` et injecte automatiquement `Authorization: Bearer <CRON_SECRET>` (valeur de la variable d'environnement du même nom sur le projet Vercel) — c'est le mécanisme de sécurisation **officiel et recommandé** par Vercel, à ne pas réinventer (ex. pas de vérification d'IP source, pas de token custom). Voir pattern exact à la Task 4.
- **Limite Hobby, rappel technique (source de la recherche menée pour cette story)** : "Hobby accounts are limited to cron jobs that run once per day. Cron expressions that would run more frequently will fail during deployment." + "Vercel may invoke these cron jobs at any point within the specified hour" (imprécision d'exécution, Hobby uniquement). Voir le callout en tête de story pour la décision produit correspondante (Charles, 2026-07-16).
- **Idempotence et exécutions manquées/dupliquées (recommandation officielle Vercel)** : "Cron job delivery is best effort... occasionally invoke the same scheduled run more than once... Design your operations to be idempotent and reconciliation-based". La condition d'éligibilité de cette story (comparaison de timestamps, pas un simple flag consommé une fois) satisfait déjà cette recommandation nativement : une invocation dupliquée du même jour ne renverrait pas de notification supplémentaire (AC #4), et une invocation manquée un jour donné serait automatiquement rattrapée le lendemain (la Conversation resterait éligible tant qu'aucune relance n'a été marquée).
- **Pas de verrou de concurrence (Redis lock, etc.)** : la documentation Vercel recommande un verrou distribué si un cron peut se chevaucher avec lui-même (exécution encore en cours au déclenchement suivant). Non nécessaire ici : le volume attendu (2 Organisateurs, échelle du produit) rend une exécution de quelques secondes très largement plus courte que l'intervalle d'un jour entre deux exécutions — risque de chevauchement nul en pratique, pas la peine d'ajouter cette complexité (NFR-1).
- **Route entrante ≠ violation d'AD-3** : AD-3 interdit les routes API custom pour les **écritures applicatives** normalement déclenchées par l'utilisateur (pour éviter deux patrons "Server Action" vs "route REST" concurrents). Cette route est déclenchée exclusivement par l'infrastructure Vercel Cron, jamais par un navigateur, et le Structural Seed du Spine anticipe explicitement ce composant ("Tâche planifiée (relance FR-15) → vérifie messages prioritaires non lus → db" + "cron → telegram"). Ce n'est donc pas une exception à documenter comme un écart — c'est le mécanisme prévu.
- **Aucune donnée de test persistante à laisser en base** après la Task 6 — même convention que toutes les stories précédentes.
- **Pas de framework de test** (toujours absent du projet) — vérification manuelle uniquement.

### Project Structure Notes

Conforme à l'arborescence de référence du Spine pour tout ce qui existait déjà. Deux ajouts non explicitement nommés dans l'arborescence source du Spine (qui ne détaillait pas encore ce composant) mais cohérents avec le Capability Map ("Relance non-lecture (FR-15) : tâche planifiée (Vercel Cron) → `lib/telegram.ts`, gouverné par AD-7") et le Structural Seed (composant `cron` explicite) :

- `app/api/cron/relance/route.ts` — seule Route Handler du projet à ce jour (tout le reste passe par des Server Actions, AD-3) ; justifiée car ce n'est pas une écriture applicative déclenchée par un navigateur, mais un point d'entrée pour l'infrastructure de scheduling Vercel, anticipé par le Spine.
- `lib/relance.ts` — nouveau module de domaine partagé, même couche que `lib/telegram.ts`/`lib/danger-keywords.ts`.

Fichiers à créer :
- `supabase/migrations/20260716000000_relance_envoyee_at.sql`
- `lib/relance.ts`
- `app/api/cron/relance/route.ts`
- `vercel.json` (n'existe pas encore dans le dépôt)

Fichiers à modifier :
- `.env.local.example` — documente `CRON_SECRET` (vide, avec commentaire)
- `.env.local` — valeur réelle renseignée par Charles (jamais commité)

Fichiers à ne pas toucher :
- `lib/telegram.ts` — réutilisé tel quel (`notifierNouveauMessage`), aucune modification (voir Dev Notes)
- `app/discussion-anonyme/actions.ts`, `app/organisateurs/*` — cette story n'ajoute aucune UI ni ne modifie aucun parcours existant
- `lib/danger-keywords.ts`, `lib/session.ts`, `lib/supabase-server.ts`, `lib/supabase-auth.ts`, `lib/env.ts` — aucun changement requis (bien que `lib/supabase-server.ts` soit importé tel quel dans `lib/relance.ts`, sans modification)

### References

- [Source: epics.md#Epic-3, Story-3.5] — story source, AC d'origine
- [Source: prd.md#FR-15 (§4.x)] — relance automatique après 4h de non-lecture d'un message prioritaire
- [Source: ARCHITECTURE-SPINE.md#AD-7] — "un seul bot Telegram... La relance FR-15 renvoie le même message aux deux si aucun organisateur n'a ouvert la Conversation sous 4h (tâche planifiée, voir Structural Seed)"
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions comme unique frontière d'écriture ; exception déjà actée pour un appel serveur sortant (Telegram) — ce cron est un point d'entrée distinct, anticipé par le Structural Seed, pas une violation
- [Source: ARCHITECTURE-SPINE.md, Structural Seed] — `cron["Tâche planifiée (relance FR-15)"] -->|"vérifie messages prioritaires non lus"| db` et `cron --> telegram`
- [Source: ARCHITECTURE-SPINE.md, section "Lu/non-lu (FR-5, FR-15)"] — définition exacte de "non traitée" (`last_organizer_read_at` null ou antérieur au dernier message `eleve`), réutilisée telle quelle par cette story
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — "Relance non-lecture (FR-15) : tâche planifiée (Vercel Cron) → `lib/telegram.ts`, gouverné par AD-7"
- [Source: ARCHITECTURE-SPINE.md#AD-10] — Vercel Hobby, gratuit ; base de la contrainte "cron 1x/jour" et de la décision de Charles (callout ci-dessus)
- [Source: _bmad-output/implementation-artifacts/3-4-notification-instantanee-...md, Review Findings] — conclusion explicite : `notifierNouveauMessage` réutilisable tel quel pour cette story, pas de refactor nécessaire
- [Source: _bmad-output/implementation-artifacts/3-4-notification-instantanee-...md, Dev Notes] — pattern `Promise.allSettled`, philosophie fail-open, absence de `requireEnv` pour les variables non critiques au chat Élève
- [Source: app/organisateurs/page.tsx:29-150, fonction chargerConversations] — pattern exact (deux requêtes + `Map`) réutilisé pour calculer le dernier message `eleve` par conversation
- [Source: app/organisateurs/actions.ts:126-151, fonction marquerLu] — confirme que `last_organizer_read_at` est le seul champ de référence pour "lu", pattern `after()` pour les écritures différées non bloquantes
- [Source: supabase/migrations/20260708000000_conversations_and_messages.sql] — colonnes existantes (`is_priority`, `last_organizer_read_at`), commentaire d'origine confirmant que `last_organizer_read_at` sert déjà FR-5 et FR-15
- [Source: lib/telegram.ts] — `notifierNouveauMessage(conversationId, estPrioritaire)`, réutilisé sans modification
- [Vercel Docs, Cron Jobs, https://vercel.com/docs/cron-jobs, consulté 2026-07-16] — syntaxe `vercel.json` (`crons: [{ path, schedule }]`), format des expressions cron supportées, limitation Hobby "once per day"
- [Vercel Docs, Managing Cron Jobs, https://vercel.com/docs/cron-jobs/manage-cron-jobs, consulté 2026-07-16] — pattern officiel `CRON_SECRET`/en-tête `Authorization: Bearer`, recommandation d'idempotence, absence de retry automatique en cas d'échec, imprécision d'exécution sur Hobby

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur/avertissement.
- `npm run build` : succès complet (Turbopack), nouvelle route `/api/cron/relance` bien générée en dynamique (ƒ).
- `CRON_SECRET` généré (`openssl rand -base64 24`) et ajouté à `.env.local`. **Ajout dans les Environment Variables Vercel (Production) refusé par le mode automatique de l'agent** ("Secret Store Writes" — écriture de secret en production non explicitement demandée par l'utilisateur). Commande laissée prête pour Charles : `vercel env add CRON_SECRET production` — voir `deferred-work.md`.
- `supabase db push --linked` : migration `20260716000000_relance_envoyee_at.sql` appliquée avec succès sur le projet distant (avertissement Docker non bloquant, lié uniquement au cache local). Colonne vérifiée requêtable via `GET /rest/v1/conversations?select=relance_envoyee_at` → `200`.
- Vérification fonctionnelle complète via `next dev` + `curl` + API REST Supabase (service role key) pour insérer/nettoyer des données de test :
  - Sans en-tête `Authorization` → `401`
  - Avec mauvais secret → `401`
  - Avec bon secret, aucune Conversation éligible → `200 {"relancesEnvoyees":0}`
  - Conversation prioritaire, message `eleve` backdaté à 5h, jamais lue/relancée → `200 {"relancesEnvoyees":1}`, aucune erreur Telegram journalisée, `relance_envoyee_at` confirmé en base
  - Ré-appel immédiat sur la même Conversation → `{"relancesEnvoyees":0}` (idempotence, AC #4)
  - Conversation prioritaire déjà lue + Conversation non prioritaire ancienne, toutes deux présentes simultanément → `{"relancesEnvoyees":0}` (AC #2, #3)
  - Nettoyage confirmé (0 trace résiduelle des 3 conversations de test)
- `vercel.json` créé mais **pas encore déployé** (pas de push sur `main` dans cette session) — le cron Vercel réel ne s'active qu'au prochain déploiement de `main`, en plus du provisionnement `CRON_SECRET` côté Vercel ci-dessus.

### Review Findings

Revue multi-angles (`code-review`, effort élevé : 8 chercheurs indépendants + vérification 1-vote par candidat), lancée sur `lib/relance.ts`, `app/api/cron/relance/route.ts`, `vercel.json`, la migration, et l'ajout `CRON_SECRET` dans `.env.local.example`. 7 findings retenus après vérification, tous corrigés ou explicitement documentés comme risque accepté :

- **Échec Telegram silencieux marqué comme envoyé (CONFIRMED, corrigé)** — `notifierNouveauMessage` n'a jamais levé d'exception vers l'appelant ; `relance_envoyee_at` était donc posé même si aucune notification n'avait réellement été délivrée, empêchant définitivement toute nouvelle tentative pour ce message. **Correction** : `notifierNouveauMessage` (`lib/telegram.ts`) retourne désormais `Promise<boolean>` (succès si au moins un `chat_id` a reçu le message) ; `lib/relance.ts` n'écrit `relance_envoyee_at` qu'après un envoi confirmé réussi.
- **Duplication en cas d'échec de l'écriture après un envoi réussi (CONFIRMED, corrigé)** et **absence de verrou contre une double invocation concurrente du cron (CONFIRMED, corrigé)** — les deux corrigés ensemble par une **réclamation atomique avant l'envoi** : l'update de `relance_envoyee_at` porte désormais une clause `.or("relance_envoyee_at.is.null,relance_envoyee_at.lt.<dernierMessageEleve>")` rejouée au moment précis de l'écriture (`.select("id")` pour détecter si la réclamation a effectivement pris) — deux exécutions concurrentes ne peuvent plus réclamer/notifier toutes les deux la même Conversation. En cas d'échec Telegram après réclamation réussie, la réclamation est explicitement annulée (`relance_envoyee_at` remis à `null`) pour permettre une nouvelle tentative au prochain passage du cron plutôt que de perdre la relance.
- **Logique "non traitée"/dernier message élève dupliquée avec `chargerConversations` (PLAUSIBLE, corrigé)** — extraite dans un nouveau module partagé `lib/conversation-lecture.ts` (`calculerDernierMessageEleveParConversation`, `estNonTraitee`), utilisé maintenant par `app/organisateurs/page.tsx` et `lib/relance.ts`, pour éviter toute divergence future sur une règle safety-critique (FR-5/FR-15).
- **Garde mort `if (eligibles.length === 0) return ...` (CONFIRMED, corrigé)** — supprimé, `Promise.allSettled([])` produisait déjà le même résultat.
- **Regroupement des updates en un seul appel batché (PLAUSIBLE, non appliqué)** — devenu incompatible avec la réclamation atomique par conversation (condition `.or()` différente par ligne) ; documenté dans `deferred-work.md`.
- **Race entre `marquerLu` (écriture différée `after()`) et la lecture du cron (PLAUSIBLE, non appliqué)** — fenêtre de quelques dizaines de millisecondes une fois par jour, impact borné à une notification redondante inoffensive ; risque accepté, documenté dans `deferred-work.md`.
- **Requêtes non paginées, risque de troncature au-delà de 1000 lignes (REFUTED)** — même classe de risque déjà explicitement acceptée pour `chargerConversations` (revue de la Story 3.2), non ré-ouverte ici.

Fenêtre résiduelle après correction (documentée dans `deferred-work.md`, risque accepté) : si la réclamation réussit mais que l'annulation qui suit un échec Telegram échoue *elle aussi* (double panne Supabase quasi simultanée), la Conversation resterait marquée "relancée" sans envoi réel — fenêtre bien plus étroite qu'avant correction, jugée négligeable.

### Completion Notes List

- Tasks 2 à 6 complètes : nouvelle colonne `relance_envoyee_at` (migration appliquée en base), `lib/relance.ts` (`envoyerRelancesEnRetard`), `app/api/cron/relance/route.ts` (sécurisée par `CRON_SECRET`), `vercel.json` (cron quotidien 06:00 UTC). `lib/telegram.ts` modifié lors de la revue de code (voir Review Findings) pour retourner `Promise<boolean>` plutôt que `Promise<void>` — seule modification apportée à ce fichier, signature élargie de façon rétrocompatible (l'appel existant dans `app/discussion-anonyme/actions.ts` ignore déjà la valeur de retour).
- Nouveau module partagé `lib/conversation-lecture.ts` (issu de la revue de code) factorisant le calcul "dernier message élève par conversation" et le prédicat "non traitée", désormais utilisé à la fois par `app/organisateurs/page.tsx` et `lib/relance.ts`.
- Task 1 complète en local (`.env.local`, `.env.local.example`) ; l'ajout en Production sur Vercel reste à faire par Charles (bloqué par le mode automatique de l'agent, action manuelle sensible sur un secret de production) — suivi dans `deferred-work.md`, non bloquant pour la revue de code (même nature de limite que le `chat_id` de Basile en Story 3.4).
- Les 6 AC sont couvertes et vérifiées manuellement en conditions quasi réelles (vraie base Supabase, vrai appel Telegram réutilisé de la Story 3.4) : #1/#2/#3/#4 vérifiées par manipulation directe de données de test avec timestamps contrôlés ; #5 vérifiée par tests `curl` positif/négatif ; #6 (résilience par Conversation) vérifiée par relecture de code (`Promise.allSettled`), cohérente avec le pattern déjà éprouvé en Story 3.4 pour les `chat_id`.
- Déploiement réel (push sur `main`) volontairement laissé à Charles, hors périmètre de cette session d'implémentation — le cron ne sera actif qu'après ce push **et** le provisionnement `CRON_SECRET` sur Vercel.

### File List

- `supabase/migrations/20260716000000_relance_envoyee_at.sql` (nouveau) — colonne `relance_envoyee_at` sur `conversations`
- `lib/relance.ts` (nouveau, modifié en revue de code) — `envoyerRelancesEnRetard()`, réclamation atomique avant envoi
- `lib/conversation-lecture.ts` (nouveau, ajouté en revue de code) — `calculerDernierMessageEleveParConversation`, `estNonTraitee`, partagés avec `app/organisateurs/page.tsx`
- `lib/telegram.ts` (modifié en revue de code) — `notifierNouveauMessage` retourne désormais `Promise<boolean>`
- `app/organisateurs/page.tsx` (modifié en revue de code) — utilise `lib/conversation-lecture.ts` au lieu de dupliquer le calcul
- `app/api/cron/relance/route.ts` (nouveau) — Route Handler GET sécurisée par `CRON_SECRET`
- `vercel.json` (nouveau) — déclaration du Cron Job (`/api/cron/relance`, quotidien 06:00 UTC)
- `.env.local.example` (modifié) — ajout de `CRON_SECRET` (documentée, vide)
- `.env.local` (modifié, jamais commité) — `CRON_SECRET` (valeur réelle générée pour cette session)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modifié) — risques résiduels de la revue de code documentés

## Change Log

- 2026-07-16 : Story créée (create-story). Recherche web menée sur les Cron Jobs Vercel : le plan Hobby (gratuit, AD-10) limite les cron jobs à une exécution quotidienne, en conflit apparent avec le délai "4h" de l'AC d'origine. Question posée à Charles (service externe gratuit vs. cron natif 1x/jour vs. upgrade payant) — décision : **cron natif Vercel, une fois par jour**, délai réel jusqu'à ~28h dans le pire cas assumé (voir callout en tête de story). Conception : nouvelle colonne `relance_envoyee_at` (idempotence, "une seule" relance par message non lu, pas un rappel quotidien) ; réutilisation intégrale de `notifierNouveauMessage` (Story 3.4, déjà anticipée pour cet usage par sa propre revue de code) ; nouvelle Route Handler `app/api/cron/relance/route.ts` sécurisée par `CRON_SECRET` (pattern officiel Vercel) ; calcul du dernier message élève par conversation en réutilisant le pattern déjà établi par `chargerConversations` (Story 3.2), sur un périmètre volontairement distinct (prioritaires uniquement).
- 2026-07-16 (implémentation) : migration `relance_envoyee_at` appliquée en base, `lib/relance.ts`/`app/api/cron/relance/route.ts`/`vercel.json` créés, `CRON_SECRET` généré et documenté. `lint`/`build` passent. Vérification manuelle complète via `curl` + données Supabase de test à timestamps contrôlés : les 6 AC confirmées (401 sans/avec mauvais secret, relance envoyée pour une Conversation éligible avec `relance_envoyee_at` mis à jour, idempotence sur ré-appel, exclusion des Conversations déjà lues et non prioritaires). Toutes les données de test nettoyées. Deux actions externes restent en attente, non bloquantes pour la revue de code (voir `deferred-work.md`) : ajout de `CRON_SECRET` sur Vercel Production (refusé par le mode automatique de l'agent, à faire par Charles) et déploiement (`vercel.json` pas encore poussé sur `main`). Passage en `review`.
- 2026-07-16 (revue de code) : Revue multi-angles (`code-review`, effort élevé, 8 chercheurs + vérification 1-vote) exécutée sur le diff complet de la story. 7 findings retenus après vérification (voir Review Findings) — 5 corrigés (échec Telegram silencieux marqué comme envoyé ; doublon possible sur échec DB après envoi réussi ; absence de verrou contre une double invocation concurrente du cron ; logique "non traitée" dupliquée avec `chargerConversations` ; garde mort), 1 non appliqué avec justification (regroupement des updates, devenu incompatible avec la réclamation atomique), 1 réfuté (requêtes non paginées, risque déjà accepté ailleurs). Deux risques résiduels mineurs documentés comme acceptés dans `deferred-work.md`. Vérification manuelle relancée après correction (lint/build/tests fonctionnels).
