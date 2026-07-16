---
baseline_commit: be58911fc9a23fabbe5ce17a37ac6150168c35f9
---

# Story 3.4: Notification instantanée sur nouveau message (et notification double en cas de priorité)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a organisateur,
I want être notifié sur Telegram dès qu'un nouveau message arrive,
so that je peux répondre dans un délai raisonnable sans surveiller le site en continu.

## ⚠️ Première story qui crée réellement le canal Telegram (AD-7)

`lib/telegram.ts` n'existe pas encore dans le dépôt. La détection de Signal de danger (Story 2.2) marque déjà `is_priority = true` en base, mais son Dev Notes le dit explicitement : *"L'envoi de l'alerte Telegram elle-même reste hors périmètre (Epic 3)"*. Cette story construit ce canal pour la première fois — pas de pattern existant à copier dans ce dépôt, contrairement aux stories précédentes d'Epic 3.

Aucune variable d'environnement Telegram n'existe non plus dans `.env.local`/`.env.local.example` à ce stade — voir Task 1 ci-dessous, qui nécessite une action manuelle de Charles (créer le bot, obtenir les deux `chat_id`) avant que la vérification manuelle (Task 4) ne soit possible.

## Acceptance Criteria

1. Given un Élève envoie un message et qu'il est enregistré avec succès en base (`messages`, `sender_type = 'eleve'`), When l'écriture est confirmée, Then un appel sortant est fait vers l'API Telegram Bot (`sendMessage`) vers **chaque** `chat_id` configuré (les deux comptes Organisateur) — donc au moins un Organisateur (en pratique les deux) reçoit une notification. [Source: epics.md#Story-3.4 AC#1; prd.md#FR-7]
2. Given le contenu du texte envoyé à Telegram, When on l'inspecte, Then il ne contient **jamais** le corps du message de l'Élève — seulement un texte générique ("Nouveau message reçu") et un lien direct vers `/organisateurs/<conversationId>` (cohérent avec le parcours décrit en `prd.md` §3.3 : *"il ouvre la notification → arrive directement sur la conversation d'Amara → lit le message"* — la lecture du contenu se fait dans l'interface protégée, jamais dans la notification elle-même, catégorie de données sensibles au sens NFR-9). [Source: prd.md §3.3 (persona Basile); ARCHITECTURE-SPINE.md, Consistency Conventions > Logs & confidentialité (principe analogue étendu à ce canal sortant)]
3. Given la Conversation est marquée prioritaire au même envoi (`signalDanger` détecté par `containsDangerSignal`, Story 2.2), When la notification part, Then elle part vers les **mêmes** deux `chat_id` (donc simultanément aux deux Organisateurs — jamais un seul face à la décision d'escalade) et le texte inclut une mention explicite de priorité pour aider au tri visuel. **Ceci termine FR-10**, resté partiellement ouvert depuis l'Epic 2 (voir Dev Notes pour l'explication du mécanisme, volontairement unique et non branché en deux chemins de code séparés). [Source: epics.md#Story-3.4 AC#2; prd.md#FR-10 conséquence testable "la notification part vers les deux Organisateurs simultanément dans ce cas précis"]
4. Given l'appel HTTP vers l'API Telegram échoue (réseau, timeout, token invalide, Telegram indisponible) pour un ou plusieurs `chat_id`, When l'échec survient, Then l'Élève n'est jamais bloqué ni informé de cet échec — l'accusé de réception (FR-3) part normalement, l'envoi Telegram est différé via `after()` (même motif que la mise à jour `is_priority` et `recordRecoveryAttempt`, déjà dans ce fichier) et l'erreur n'est journalisée qu'en métadonnées techniques (jamais le contenu du message ni un secret). [Source: ARCHITECTURE-SPINE.md, NFR-2; Consistency Conventions > Logs & confidentialité]
5. Given `TELEGRAM_BOT_TOKEN` ou `TELEGRAM_CHAT_IDS` absent ou vide dans l'environnement, When un Élève envoie un message, Then l'envoi du message et l'accusé de réception fonctionnent normalement (le chat élève ne dépend jamais de la configuration Telegram, NFR-2) — seule la notification est silencieusement sautée, avec une erreur journalisée (métadonnées seulement) pour rester diagnostiquable. **Ceci diverge intentionnellement** du garde-fou fail-fast `requireEnv` déjà utilisé pour `SUPABASE_*`/`ORGANISATEUR_EMAILS` (`lib/env.ts`) — voir Dev Notes pour la justification. [Edge case dérivé de NFR-2, nécessaire vu que ces variables n'existent pas encore en local au moment de la création de cette story]
6. Given un des deux `chat_id` échoue (ex. un Organisateur a bloqué le bot) mais pas l'autre, When la notification est envoyée, Then l'autre `chat_id` reçoit quand même sa notification — les deux appels sont indépendants (pas d'échec groupé). [Edge case — nécessaire pour ne pas perdre la notification du second Organisateur à cause d'un problème isolé au premier]

## Tasks / Subtasks

- [x] Task 1 (préalable, hors code) : Provisionner le bot Telegram et les deux `chat_id` — action manuelle de Charles, bloquante pour la vérification (AC: tous, prérequis)
  - [x] Créer un bot via `@BotFather` sur Telegram (commande `/newbot`), récupérer le `TELEGRAM_BOT_TOKEN` — fait par Charles (`@laparoleavanttout_bot`)
  - [x] Charles démarre une conversation avec le bot (`/start`) — fait ; **chat_id de Basile toujours manquant** (voir Dev Notes/Change Log), `TELEGRAM_CHAT_IDS` ne contient pour l'instant que celui de Charles
  - [x] Appeler `https://api.telegram.org/bot<TOKEN>/getUpdates` pour lire le `chat.id` — fait ; **piège rencontré et corrigé** : Charles avait initialement pris `update_id` (443474022) au lieu de `chat.id` (6721003957) dans la réponse JSON, les deux nombres apparaissant l'un après l'autre dans le payload — corrigé après un premier test Telegram en échec (`"chat not found"`, voir Debug Log)
  - [x] Renseigné dans `.env.local` (jamais commité) : `TELEGRAM_BOT_TOKEN=...` (réel) et `TELEGRAM_CHAT_IDS=6721003957` (Charles seul pour l'instant)
  - [ ] Ajouter les mêmes variables (valeurs réelles) dans les Environment Variables du projet Vercel (Production) — **pas encore fait**, sans quoi la notification serait silencieusement absente en production (AC #5, fail-open) ; à faire par Charles avant le prochain déploiement
  - [x] Documenter les deux nouvelles variables (vides, avec commentaire explicatif) dans `.env.local.example`, même format que les entrées `SUPABASE_*`/`ORGANISATEUR_EMAILS` existantes

- [x] Task 2 : `lib/telegram.ts` — nouveau module (AC: #1, #2, #3, #4, #5, #6)
  - [x] Lire `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS` **à l'intérieur de la fonction exportée**, pas via `requireEnv` au chargement du module (voir Dev Notes — divergence volontaire du pattern `lib/supabase-server.ts`/`lib/supabase-auth.ts`) ; parser `TELEGRAM_CHAT_IDS` par `.split(",").map(s => s.trim()).filter(Boolean)`, même style que `organisateurEmails` dans `lib/supabase-auth.ts`
  - [x] Si l'une des deux variables est absente/vide → `console.error` (métadonnées seulement : "Telegram non configuré", jamais de token/id) et retour immédiat, sans lever d'exception (AC #5)
  - [x] Exporter `notifierNouveauMessage(conversationId: string, estPrioritaire: boolean): Promise<void>` — ne lève **jamais** d'exception vers l'appelant (même philosophie que `recordRecoveryAttempt`/`findConversationBySessionToken` dans `lib/session.ts` : tout `try/catch` interne, erreurs avalées et journalisées)
  - [x] Construire le texte : générique, sans corps de message (AC #2) — ex. `"Nouveau message reçu."` (ou `"⚠️ Conversation prioritaire — nouveau message."` si `estPrioritaire`), suivi d'un lien vers la conversation si `SITE_URL` est configuré (voir ci-dessous) ; ne jamais interpoler le contenu du message élève dans ce texte
  - [x] Nouvelle variable d'environnement **optionnelle** `SITE_URL` (ex. `https://laparoleavanttout.example`, sans slash final) lue directement via `process.env.SITE_URL` (pas `requireEnv` — optionnelle, voir Dev Notes) : si présente, ajouter une ligne `${SITE_URL}/organisateurs/${conversationId}` au texte (Telegram linkifie automatiquement une URL brute en texte, aucun `parse_mode` requis) ; si absente, envoyer le texte sans lien plutôt que d'échouer
  - [x] Pour chaque `chat_id` de la liste, appeler en parallèle (`Promise.allSettled`, pas `Promise.all` — AC #6, un échec ne doit jamais annuler les autres) `fetch("https://api.telegram.org/bot${token}/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id, text }) })`
  - [x] Vérifier `response.ok` (et idéalement le champ `ok` du JSON retourné par Telegram, qui peut être `false` avec un statut HTTP 200 sur certaines erreurs) ; journaliser tout échec par `chat_id` (métadonnées seulement : `chat_id`, code de statut — jamais le texte envoyé, cohérent avec la convention "Logs & confidentialité" même si ce texte ne contient déjà aucun contenu élève)

- [x] Task 3 : Brancher l'appel dans `app/discussion-anonyme/actions.ts` (AC: #1, #3, #4)
  - [x] Dans `envoyerMessage`, après l'insertion réussie du message (juste avant/à côté du bloc `if (signalDanger) { after(...) }` existant, lignes ~198-217), ajouter un **second** appel `after()`, inconditionnel (pas à l'intérieur du `if (signalDanger)`) : `after(() => notifierNouveauMessage(conversationId, signalDanger))`
  - [x] Réutiliser directement la variable `signalDanger` déjà calculée plus haut dans la fonction (avant l'insertion, ligne ~142) comme paramètre `estPrioritaire` — ne jamais requêter à nouveau `is_priority` en base pour ça, la valeur est déjà connue et évite toute course avec l'écriture différée de la ligne ~200
  - [x] Ne toucher à aucune autre partie de `envoyerMessage` (validation, insertion, accusé de réception) — cette story n'ajoute qu'un appel différé supplémentaire, jamais bloquant (AC #4)
  - [x] Importer `notifierNouveauMessage` depuis `@/lib/telegram` en tête de fichier, même style d'import que les autres helpers `lib/`

- [x] Task 4 : Vérification manuelle (AC: #1 à #6)
  - [x] `npm run lint` et `npm run build` passent — build relancé **sans aucune variable Telegram** (avant que Charles ne les renseigne) : succès complet, confirmant AC #5 (aucun crash au chargement du module)
  - [x] Script Node ad hoc temporaire (`verify-story-3-4.tmp.mjs`, racine du projet, jamais commité, supprimé après exécution — même précédent que les stories précédentes) reproduisant exactement la logique de `notifierNouveauMessage` (même construction du texte, même appel `sendMessage`), exécuté contre le vrai bot Telegram et le vrai `chat_id` de Charles : notification normale ET notification prioritaire reçues et confirmées par Charles. **Limite connue** : le `chat_id` de Basile n'était pas encore disponible au moment de cette vérification (voir Task 1) — seul un `chat_id` a donc pu être testé en conditions réelles ; l'indépendance des envois multiples (AC #6, `Promise.allSettled`) est garantie par la structure du code (relecture), pas par un test à deux `chat_id` réels.
  - [x] Notification prioritaire testée dans le même script (`estPrioritaire=true`) : texte reçu par Charles contient bien la mention "⚠️ Conversation prioritaire" (AC #3)
  - [x] Aucun des deux textes reçus ne contient de corps de message (AC #2) — vérifié par construction : `buildTexte()` ne prend jamais le contenu d'un message élève en paramètre, seulement `conversationId`/`estPrioritaire`, donc aucune fuite possible même par erreur de code futur non détectée par ce test précis
  - [x] Comportement sans configuration Telegram (AC #5) vérifié par relecture de code (retour anticipé avant tout I/O dans `notifierNouveauMessage`, jamais de throw) + par le `build` réussi sans ces variables (ci-dessus) — pas de second test runtime supplémentaire jugé nécessaire au-delà de ces deux garanties
  - [x] **Limite connue, cohérente avec les stories précédentes (3.2/3.3)** : le passage réel par l'interface `/discussion-anonyme` (formulaire élève → Server Action `envoyerMessage` → `after()` → `notifierNouveauMessage`) n'a pas pu être exercé clic-à-clic (pas d'outil de navigateur disponible dans cette session). Le déclenchement de la notification a été vérifié indépendamment (ci-dessus, vrai appel Telegram) et le branchement dans `envoyerMessage` a été vérifié par relecture de code + `lint`/`build` (TypeScript aurait signalé toute incompatibilité de signature). Risque résiduel jugé faible : le `after()` ajouté est structurellement identique au `after()` déjà existant et éprouvé juste au-dessus (mise à jour `is_priority`, Story 2.2).
  - [x] Aucune donnée de test insérée en base pour cette story (le test Telegram n'a nécessité aucune écriture Supabase, seulement un `conversationId` fictif dans le texte) — rien à nettoyer

### Review Findings

Revue multi-angles (`code-review`, effort élevé : 8 chercheurs indépendants + vérification 1-vote par candidat), lancée sur le diff complet de la story (working tree, `lib/telegram.ts` + modification d'`app/discussion-anonyme/actions.ts`). 6 candidats remontés, **aucun n'a survécu à la vérification** (tous `REFUTED`) :

- Texte "prioritaire" reflétant `signalDanger` du message courant plutôt que l'état cumulatif `is_priority` — réfuté : comportement explicitement spécifié par l'AC #3, et la notification inclut toujours un lien direct vers le tableau de bord qui, lui, montre le vrai statut sticky.
- Commentaire "hors périmètre (Epic 3)" jugé obsolète — réfuté : ce commentaire est scopé au bloc `is_priority` qui le précède directement, pas à toute la fonction ; un commentaire distinct et à jour existe déjà pour le nouveau bloc Telegram.
- `getChatIds()` sans déduplication — réfuté : configuration à 2 entrées provisionnée à la main, un doublon serait immédiatement visible (message reçu deux fois) et trivial à corriger, pas un risque silencieux.
- `notifierNouveauMessage` pas réutilisable pour la Story 3.5 (relance 4h) — réfuté : le Spine d'architecture (AD-7) précise explicitement que la relance renvoie le **même message**, donc la signature actuelle (`boolean`) suffit déjà sans refactor.
- Absence de timeout sur le `fetch` Telegram — réfuté : seul appel réseau du projet et cohérent avec l'absence de timeout déjà présente sur tous les appels Supabase existants ; `after()` est fire-and-forget, sans impact sur la disponibilité du chat Élève (NFR-2).
- `after()` pouvant lever une exception synchrone — réfuté par lecture du code source de Next.js (`node_modules/next/dist/server/after/`) : aucune des conditions de throw documentées ne s'applique à cet appel, structurellement identique à l'`after()` déjà existant et éprouvé (`recordRecoveryAttempt`).

Aucune correction nécessaire. Passage en `done`.

## Dev Notes

- **Un seul mécanisme de notification, jamais deux chemins de code séparés "normal" vs "urgent"** : AD-7 le dit explicitement dans sa clause *Prevents* — *"un canal de notification 'normal' différent d'un canal 'urgence' — complexité et code dupliqués pour un bénéfice nul à cette échelle"*. La conception retenue ici (envoyer systématiquement aux **deux** `chat_id` configurés, sur **chaque** message, prioritaire ou non) satisfait donc trivialement les deux AC de la story : AC #1 ("au moins un Organisateur reçoit une notification") est dépassée puisque les deux la reçoivent toujours ; AC #3 ("si prioritaire, les deux simultanément") est vraie par construction, sans branche conditionnelle sur les destinataires — seul le **texte** varie selon `estPrioritaire`. Ne pas réintroduire une logique "un seul destinataire pour le cas normal" : ce serait un chemin de code supplémentaire pour un bénéfice nul (FR-7 dit lui-même : *"la notification fonctionne indépendamment du fait que le message contienne ou non un Signal de danger"*), et cela irait à l'encontre d'AD-7.
- **Pourquoi le corps du message n'est jamais inclus dans la notification Telegram** : ce n'est écrit littéralement ni dans les AC d'`epics.md` ni dans FR-7/FR-10, mais c'est une conséquence directe de deux éléments du Spine/PRD pris ensemble : (1) les messages élève sont une catégorie de données sensibles (NFR-9, santé mentale de mineurs) que le produit s'efforce déjà de ne jamais faire fuiter au-delà de ce qui est strictement nécessaire (ex. "Logs & confidentialité" : aucun contenu de message dans les logs serveur) ; (2) le parcours décrit dans `prd.md` §3.3 (persona Basile) montre explicitement que la lecture du message se fait *après* avoir ouvert la notification et être arrivé sur la conversation, pas dans la notification elle-même. Envoyer le corps du message à l'API Telegram (un service tiers, hors du périmètre serveur contrôlé par AD-4) romprait ce principe pour un gain d'ergonomie marginal. D'où le texte générique + lien vers `/organisateurs/<conversationId>` plutôt qu'un extrait du message.
- **Pourquoi `lib/telegram.ts` n'utilise PAS `requireEnv` (divergence volontaire du pattern établi)** : `lib/supabase-server.ts` et `lib/supabase-auth.ts` lèvent une exception au chargement du module si une variable requise manque (`requireEnv`, Story 3.1) — cohérent pour Supabase, dont l'app entière dépend (rien ne fonctionne sans base de données). Mais `app/discussion-anonyme/actions.ts` importerait `lib/telegram.ts` au niveau module : si `notifierNouveauMessage` levait au chargement faute de token, **tout le chat Élève** (fonctionnalité cœur du produit) serait indisponible à cause d'une notification mal configurée — contradiction frontale avec NFR-2 (*"le chat doit rester accessible en continu, même si la réponse humaine ne l'est pas"*). Les variables Telegram doivent donc être lues à l'intérieur de la fonction, pas au chargement du module, avec un retour silencieux (loggué) si absentes — jamais un throw qui remonterait jusqu'à l'Élève.
- **`SITE_URL` est optionnelle, pas une nouvelle dépendance dure** : contrairement aux variables Telegram (sans lesquelles la notification entière n'a aucun sens), `SITE_URL` ne sert qu'à enrichir le texte d'un lien cliquable. Son absence ne doit jamais empêcher l'envoi de la notification elle-même (juste omettre la ligne de lien) — même philosophie fail-open que le reste de cette story.
- **`Promise.allSettled`, pas `Promise.all`, pour les deux appels `chat_id`** : `Promise.all` court-circuite au premier rejet, ce qui priverait le second Organisateur de sa notification si le premier appel échoue (ex. un des deux a bloqué le bot) — contraire à AC #6 et à l'esprit "jamais un seul face à la décision" de FR-10.
- **Pas de SDK Telegram** : AD-7 est explicite ("API Telegram Bot, HTTPS, gratuite, sans SDK") — un simple `fetch` vers `sendMessage` suffit, cohérent avec Node.js 24 (fetch natif, aucune nouvelle dépendance `package.json`).
- **`signalDanger` déjà calculé, ne pas le recalculer ni requêter `is_priority`** : `envoyerMessage` calcule déjà `signalDanger` avant l'insertion (ligne ~142, fonction pure `containsDangerSignal`). Le passer directement à `notifierNouveauMessage` comme `estPrioritaire` évite toute course avec le second `after()` (mise à jour `is_priority` en base, ligne ~198-217) — les deux `after()` s'exécutent indépendamment après la réponse, aucun des deux ne dépend du résultat de l'autre.
- **Pas de framework de test** (toujours absent du projet) — vérification manuelle uniquement, bloquée par Task 1 (identifiants Telegram réels) tant que Charles ne les a pas fournis, même nature de limite que les identifiants Organisateur Supabase en Stories 3.2/3.3.
- **Aucune nouvelle migration, aucune nouvelle table** : cette story ne touche à aucune colonne — `is_priority` existe déjà (Story 2.2), et rien de nouveau n'a besoin d'être persisté (la notification est un effet de bord sortant, pas une donnée à stocker).

### Project Structure Notes

Conforme à l'arborescence de référence du Spine : `lib/telegram.ts` (nouveau, chemin exact prévu par le Spine) et une modification ciblée d'`app/discussion-anonyme/actions.ts` (chemin exact prévu, FR-7/FR-10). Aucune variance structurelle.

Fichiers à créer :
- `lib/telegram.ts` — `notifierNouveauMessage(conversationId, estPrioritaire)`, lecture paresseuse des variables d'environnement, appels `fetch` parallèles vers l'API Telegram

Fichiers à modifier :
- `app/discussion-anonyme/actions.ts` — ajoute un second `after()` inconditionnel dans `envoyerMessage`, ne touche à rien d'autre
- `.env.local.example` — documente `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`, `SITE_URL` (vides, avec commentaires)
- `.env.local` — valeurs réelles renseignées par Charles (jamais commité, déjà dans `.gitignore`)

Fichiers à ne pas toucher :
- `lib/danger-keywords.ts`, `lib/session.ts`, `lib/supabase-server.ts`, `lib/supabase-auth.ts` — aucun changement requis
- `app/organisateurs/*` — cette story ne construit aucune UI, seulement l'émission de la notification côté Élève

### References

- [Source: epics.md#Epic-3, Story-3.4] — story source, AC d'origine
- [Source: prd.md#FR-7 (§4.4)] — notification quasi instantanée, "au moins un Organisateur... en moins de 10 minutes dans 90% des cas", indépendante d'un Signal de danger
- [Source: prd.md#FR-10 (§4.5)] — "la notification part vers les deux Organisateurs simultanément dans ce cas précis — jamais un seul face à la décision d'escalade"
- [Source: prd.md §3.3, persona Basile] — parcours "il ouvre la notification → arrive directement sur la conversation d'Amara → lit le message", base du choix de ne jamais inclure le corps du message dans la notification
- [Source: ARCHITECTURE-SPINE.md#AD-7] — un seul bot Telegram, un `chat_id` par Organisateur, appel HTTP sortant après écriture en base, clause *Prevents* contre un canal "normal" séparé d'un canal "urgence"
- [Source: ARCHITECTURE-SPINE.md, NFR-2] — le chat doit rester accessible en continu, même si la réponse humaine (ou la notification) ne l'est pas — base de la divergence par rapport à `requireEnv`
- [Source: ARCHITECTURE-SPINE.md, Consistency Conventions > Logs & confidentialité] — jamais de contenu de message dans les logs/canaux sortants au-delà du strict nécessaire
- [Source: ARCHITECTURE-SPINE.md, Arborescence source] — chemin exact attendu `lib/telegram.ts`
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — "Notification (FR-7) : lib/telegram.ts, gouverné par AD-7" ; "Alerte silencieuse aux organisateurs (FR-10) : app/discussion-anonyme/actions.ts + lib/telegram.ts"
- [Source: _bmad-output/implementation-artifacts/2-2-detection-automatique-de-signal-de-danger-et-affichage-immediat-des-numeros.md, Dev Notes] — "L'envoi de l'alerte Telegram elle-même reste hors périmètre (Epic 3)", confirme que cette story est bien le point d'entrée du canal
- [Source: app/discussion-anonyme/actions.ts:142,198-217] — `signalDanger` déjà calculé, pattern `after()` existant à réutiliser à l'identique
- [Source: lib/supabase-auth.ts:20-25] — pattern de parsing d'une liste séparée par virgules (`ORGANISATEUR_EMAILS`), réutilisé pour `TELEGRAM_CHAT_IDS`
- [Source: lib/env.ts] — `requireEnv`, pattern fail-fast existant, volontairement **non** réutilisé ici (voir Dev Notes)
- [Source: .env.local.example] — convention de documentation des variables d'environnement (commentaire explicatif + valeur vide)
- [API Telegram Bot, `sendMessage`, api.telegram.org/bot<token>/sendMessage — POST JSON `{chat_id, text}`, HTTPS, sans SDK, cf. AD-7]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur/avertissement.
- `npm run build` : succès complet (6 routes générées), lancé une première fois **sans aucune variable Telegram configurée** — confirme AC #5 (le chat Élève et le build restent fonctionnels même si `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS` sont absents, divergence volontaire du pattern `requireEnv`).
- Task 1 réalisée par Charles : bot Telegram créé via `@BotFather` (`@laparoleavanttout_bot`), token obtenu.
- **Incident de vérification (piège chat_id vs update_id)** : premier test réel (`verify-story-3-4.tmp.mjs`) en échec avec `"chat not found"` — Charles avait pris `443474022` comme `chat_id`, alors que ce nombre était en réalité l'`update_id` de la réponse `getUpdates` (les deux champs apparaissent l'un après l'autre dans le JSON, piège facile pour un premier essai). Vérification directe via `curl https://api.telegram.org/bot<TOKEN>/getMe` + `getUpdates` : le token correspondait bien au bon bot, mais le vrai `chat.id` de Charles est `6721003957`. `.env.local` corrigé (`TELEGRAM_CHAT_IDS=6721003957`) — second test réussi.
- Script `verify-story-3-4.tmp.mjs` (racine du projet, jamais commité, supprimé après exécution) : reproduit exactement la logique de `buildTexte()`/`notifierNouveauMessage()` (sans dépendre des alias TypeScript `@/`, pour rester exécutable en Node simple) et appelle le vrai `sendMessage` Telegram. Deux envois testés (`estPrioritaire=false` puis `true`) contre le vrai `chat_id` de Charles — les deux confirmés reçus par Charles directement dans la conversation.
- `npm run build` relancé après ajout des vraies valeurs Telegram : succès complet (aucune régression).
- **Limite connue** : le `chat_id` de Basile n'a pas pu être obtenu dans cette session (dépendance externe, Basile doit lui-même envoyer un message au bot) — seul un `chat_id` réel a donc pu être testé, pas l'indépendance entre plusieurs `chat_id` (AC #6, garantie par relecture de `Promise.allSettled` plutôt que par un test à deux comptes réels). Les variables Environment du projet Vercel (Production) n'ont pas non plus été renseignées dans cette session — à faire par Charles avant le prochain déploiement, sans quoi la notification serait silencieusement absente en production (comportement fail-open volontaire, AC #5, pas un bug).
- Comme pour les Stories 3.2/3.3 : aucun outil de navigateur disponible dans cette session — le passage réel par le formulaire `/discussion-anonyme` (clic-à-clic) n'a pas été exercé. Le déclenchement de la notification a été vérifié indépendamment (vrai appel Telegram, ci-dessus) et le branchement dans `envoyerMessage` par relecture de code + `lint`/`build` (le second `after()` est structurellement identique à celui, déjà éprouvé, de la mise à jour `is_priority` juste au-dessus).

### Completion Notes List

- Tasks 2 et 3 complètes : `lib/telegram.ts` créé (`notifierNouveauMessage`), branché de façon inconditionnelle et non bloquante (`after()`) dans `envoyerMessage` (`app/discussion-anonyme/actions.ts`), réutilisant `signalDanger` déjà calculé comme `estPrioritaire` — un seul mécanisme notifie toujours les deux `chat_id` configurés, conforme à AD-7 (pas de branche séparée pour le cas prioritaire).
- `.env.local.example` documenté avec `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`, `SITE_URL` (optionnelle).
- Aucune nouvelle dépendance (`fetch` natif, cohérent avec AD-7 "sans SDK").
- Task 4 exécutée avec un vrai bot Telegram et un vrai `chat_id` (Charles) — notification normale et prioritaire toutes deux reçues et confirmées. Deux éléments externes restent en attente, non bloquants pour la revue de code, suivis dans `deferred-work.md` : `chat_id` de Basile, et variables Environment Vercel (Production).
- Les 6 AC sont couvertes : #1/#2/#3 vérifiées par vrai appel Telegram ; #4/#5 vérifiées par relecture de code + `build` réussi sans configuration ; #6 vérifiée par relecture de code (`Promise.allSettled`), pas par test à deux comptes réels (limite documentée ci-dessus).

### File List

- `lib/telegram.ts` (nouveau) — `notifierNouveauMessage(conversationId, estPrioritaire)`
- `app/discussion-anonyme/actions.ts` (modifié) — import de `notifierNouveauMessage`, second `after()` inconditionnel dans `envoyerMessage`
- `.env.local.example` (modifié) — ajout de `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`, `SITE_URL` (documentées, vides)
- `.env.local` (modifié par Charles, jamais commité) — `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS` (Charles seul pour l'instant)

## Change Log

- 2026-07-16 : Story créée (create-story) — première story à construire réellement `lib/telegram.ts` (AD-7), aucune variable d'environnement Telegram n'existe encore en local. Task 1 (provisionnement manuel du bot + chat_ids par Charles) bloquante pour la vérification complète (Task 4), même nature de dépendance externe que le provisionnement Supabase Auth en Story 3.1.
- 2026-07-16 (implémentation) : `lib/telegram.ts` créé, branché dans `envoyerMessage` (Tasks 2/3). Charles a créé le bot Telegram et fourni son `chat_id` (avec une confusion initiale `update_id`/`chat_id`, corrigée après un premier test en échec — voir Debug Log). Vérification manuelle exécutée avec de vraies valeurs contre le vrai bot Telegram : notification normale et prioritaire toutes deux reçues et confirmées par Charles. `lint`/`build` passent, y compris sans configuration Telegram (AC #5). Deux actions externes restent en attente (`chat_id` de Basile, variables Vercel Production) — ajoutées à `deferred-work.md`, non bloquantes pour la revue de code. Passage en `review`.
- 2026-07-16 (variables Vercel) : `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS` ajoutées en Production sur Vercel (`vercel env add`, confirmé par `vercel env ls`) — ne reste en attente que le `chat_id` de Basile (voir `deferred-work.md`), sans impact sur la revue de code.
- 2026-07-16 (revue de code) : Revue multi-angles (`code-review`, effort élevé, 8 chercheurs + vérification 1-vote) exécutée sur le diff complet. 6 candidats remontés, tous `REFUTED` après vérification (voir Review Findings) — aucune correction nécessaire. Passage en `done`.
