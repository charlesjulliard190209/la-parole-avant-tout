---
baseline_commit: a410797141cbbcc32e7aed97a63dec227199d7fa
---

# Story 2.2: Détection automatique de Signal de danger et alerte silencieuse aux organisateurs

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève qui écrit un message évoquant un danger sérieux,
I want que ma détresse déclenche une alerte immédiate vers les organisateurs sans que j'aie besoin de rien faire de plus,
so that de l'aide humaine puisse arriver vite, même si personne n'a encore lu mon message — sans que rien ne me soit montré ni ne me signale que quelque chose s'est déclenché.

## Acceptance Criteria

1. Given un Élève envoie un message contenant un mot-clé/expression de la liste de danger, When la Server Action `envoyerMessage` traite ce message, Then la détection s'exécute côté serveur (fonction pure, aucun appel réseau) avant toute écriture en base pour ce message et avant le calcul de l'accusé de réception. [Source: epics.md#Story-2.2, AC #1]
2. Given un message détecté comme Signal de danger, Then l'Élève ne voit rigoureusement rien de différent d'un message ordinaire : le même accusé de réception aléatoire s'affiche (FR-3, `lib/accuse-reception.ts`), sans aucun numéro d'urgence, sans texte, icône, ou état visuel indiquant qu'une détection a eu lieu. Le rendu de `app/discussion-anonyme/page.tsx` (et de tout composant qu'il utilise) ne doit jamais lire, importer, ni dépendre du résultat de cette détection — ni maintenant, ni via un futur ajout. [Source: epics.md#Story-2.2 AC #2 ; prd.md FR-10 ; ARCHITECTURE-SPINE.md AD-6 "Le rendu de `app/discussion-anonyme/page.tsx` ne doit jamais dépendre du résultat de cette détection"]
3. Given un message détecté comme Signal de danger, Then la `Conversation` correspondante est marquée `is_priority = true` en base de données. La colonne existe déjà (migration `20260708000000_conversations_and_messages.sql`) — **aucune nouvelle migration n'est nécessaire pour cette story**. [Source: epics.md#Story-2.2 AC #3 ; supabase/migrations/20260708000000_conversations_and_messages.sql]
4. Given une Conversation déjà marquée prioritaire par un message précédent, When un Élève envoie un nouveau message qui ne contient, lui, aucun mot-clé de danger, Then `is_priority` reste `true` — cette story n'écrit jamais `is_priority: false`, seulement `is_priority: true` sur détection positive. Ne jamais faire une mise à jour inconditionnelle du champ avec le résultat de la détection du message courant (ex. `.update({ is_priority: signalDanger })`), ce qui effacerait silencieusement une priorisation antérieure légitime. [Prévention de régression — non explicite dans epics.md mais impératif au vu du modèle de données]
5. Given la liste de mots-clés/expressions de danger, Then elle vit exclusivement dans un fichier de configuration versionné `lib/danger-keywords.ts` — aucune table Supabase, aucun appel réseau, aucun modèle d'IA de compréhension du langage. Modifier la liste = éditer ce fichier et redéployer (push GitHub → Vercel redéploie automatiquement). [Source: epics.md#Story-2.2 AC #4 ; ARCHITECTURE-SPINE.md AD-6]
6. Given le modèle de données, Then le champ `flagged_missed_danger` existe déjà sur `conversations` (même migration que #3) et n'est touché par aucun code de cette story — il est réservé à un usage futur en Epic 3 (signalement rétroactif par un Organisateur). [Source: epics.md#Story-2.2 AC #5]
7. Given le type `EnvoyerMessageState` retourné par `envoyerMessage` (`{ error: string | null; accuse: string | null }`), Then cette story n'y ajoute **aucun** champ (ex. pas de `danger: boolean`) — le résultat de la détection ne doit jamais transiter vers le composant client `message-form.tsx`, même sous une forme qui ne serait pas affichée aujourd'hui. [Prévention de régression, découle directement de l'AC #2]

## Tasks / Subtasks

- [x] Task 1: Créer `lib/danger-keywords.ts` (AC: #1, #5)
  - [x] Exporter `DANGER_KEYWORDS: string[]` — liste de mots-clés/expressions associés à un risque sérieux (idées suicidaires, automutilation — catégories du PRD FR-9). **Aucune liste validée n'existe dans les artefacts de planification** (le PRD qualifie explicitement ce mécanisme d'hypothèse `[ASSUMPTION]` à confirmer avec Charles, §4.5 et §8 Questions ouvertes). Partir d'une liste de départ raisonnable en français (ex. variantes autour de "suicide", "me tuer", "en finir", "envie de mourir", "me faire du mal", "scarification", "automutilation"), documentée en commentaire comme hypothèse non validée cliniquement, à réviser avec Charles avant tout lancement public — même traitement que la liste de numéros d'urgence de l'ex-Story 2.1 (livrée non bloquée, signalée comme point ouvert).
  - [x] Exporter `containsDangerSignal(message: string): boolean` — fonction pure, synchrone, sans I/O : normalise le message (`toLowerCase()` minimum) et teste une correspondance simple (`includes`) contre `DANGER_KEYWORDS`. Pas de regex complexe, pas de dépendance externe, cohérent avec AD-6 ("test de correspondance simple") et le Non-Goal PRD §5 (pas de modèle d'IA).
  - [x] En-tête de fichier en commentaire : référence AD-6 et le caractère non figé de la liste (mêmes conventions de commentaire que `lib/accuse-reception.ts`, qui référence AD-11).

- [x] Task 2: Appeler la détection dans `envoyerMessage` (`app/discussion-anonyme/actions.ts`) (AC: #1, #2, #3, #4, #7)
  - [x] Importer `containsDangerSignal` depuis `@/lib/danger-keywords`.
  - [x] Juste après la validation existante de `message` (longueur/vide) et **avant** le premier appel Supabase de la fonction (avant `supabaseServer.from("conversations").select(...)`), calculer `const signalDanger = containsDangerSignal(message);`. C'est une fonction pure sans I/O : la placer ici suffit à satisfaire "détecté avant toute écriture en base" (AC #1) sans changer l'ordre des vérifications d'autorisation existantes (conversation trouvée, session/cookie autorisé) — ces vérifications restent inchangées et continuent de s'exécuter avant tout.
  - [x] Ne rien changer au bloc d'autorisation existant (lignes ~138–165 de l'état actuel du fichier) : la détection ne doit jamais court-circuiter ou modifier la logique d'autorisation déjà en place.
  - [x] Après l'insertion réussie du message (`.from("messages").insert(...)`, bloc existant), **si `signalDanger` est `true` uniquement**, exécuter une mise à jour ciblée : `supabaseServer.from("conversations").update({ is_priority: true }).eq("id", conversationId)`. Ne jamais appeler cette mise à jour si `signalDanger` est `false` (AC #4).
  - [x] Si cette mise à jour échoue, logger l'erreur avec `console.error` (métadonnées seulement : `conversationId`, l'erreur Supabase — jamais le contenu du message, cohérent avec les logs existants du fichier et la convention "Logs & confidentialité" de l'Architecture Spine) **sans** faire échouer la requête ni changer la valeur retournée à l'Élève : le message est déjà bien envoyé et doit rester un succès pour lui (même logique de disponibilité — NFR-2 — que le reste du fichier, ex. `recordRecoveryAttempt`/`isRecoveryLocked` dans `lib/session.ts` qui fail-open plutôt que de bloquer l'Élève). Ce choix est un compromis assumé : en cas d'échec de cette écriture, le filet humain (Organisateurs qui lisent tous les messages) et le signalement a posteriori (`flagged_missed_danger`, futur Epic 3, SM-2bis) restent le filet de secours — ne pas ajouter de logique de retry, ce serait de la sur-ingénierie pour ce cas.
  - [x] Ne toucher à aucun autre endroit du fichier (`choisirModeSauvegarder`, `choisirModeEphemere`, `recupererConversationParCode` restent inchangées).
  - [x] Ne pas ajouter de champ au type `EnvoyerMessageState` ni au retour de la fonction (AC #7) — le `return { error: null, accuse: getAccuseReceptionAleatoire() }` final reste exactement dans sa forme actuelle, appelé que `signalDanger` soit `true` ou `false`.

### Review Findings

- [x] [Review][Patch] Faux négatif possible sur mots-clés accentués [lib/danger-keywords.ts] — `containsDangerSignal` ne faisait que `.toLowerCase()`, sans normaliser les accents/formes Unicode (NFC vs NFD) : un message dangereux tapé ou encodé différemment du mot-clé stocké pouvait échapper à la détection. Corrigé : ajout de `normaliserAccents()` (décomposition NFD + suppression des marques diacritiques) appliquée au message et à chaque mot-clé avant comparaison. Vérifié par test direct (message avec "î"/"à" en forme NFD réellement décomposée via `.normalize("NFD")`) : détection toujours positive.
- [x] [Review][Patch] Latence évitable sur le chemin de réponse à l'Élève [app/discussion-anonyme/actions.ts:193] — la mise à jour `is_priority` était `await`-ée avant de répondre à l'Élève, ajoutant un aller-retour Supabase supplémentaire précisément quand un Signal de danger est détecté (le cas où la rapidité de l'accusé de réception, FR-3, importe le plus). Corrigé : différée via `after()` (`next/server`), même motif que `recordRecoveryAttempt` déjà présent plus bas dans ce fichier — écriture silencieuse, jamais lue par l'appelant, ne doit pas faire attendre l'Élève.
- [x] [Review][Patch] Mots-clés redondants dans `DANGER_KEYWORDS` [lib/danger-keywords.ts] — "me suicider" et "me suicide" étaient des entrées mortes (déjà couvertes par "suicide" seul via la correspondance par sous-chaîne) ; "disparaitre a jamais" (variante sans accent) est devenu redondant après l'ajout de la normalisation des accents ci-dessus. Corrigé : les 3 entrées retirées, liste réduite à 11 mots-clés sans perte de couverture.

- [x] Task 3: Vérification manuelle (AC: #1 à #7)
  - [x] `grep -rn "signalDanger\|is_priority\|containsDangerSignal" app/discussion-anonyme/page.tsx app/discussion-anonyme/message-form.tsx app/discussion-anonyme/conversation-thread.tsx` doit ne rien retourner — confirme qu'aucun composant de présentation ne référence la détection (AC #2).
  - [x] `npm run lint` et `npm run build` : aucune erreur.
  - [x] Contre le serveur `next dev` réel (déjà lancé par Charles, ne pas le redémarrer — même pattern que les Stories 1.4/1.5/2.1) : créer une conversation de test (mode éphémère, le plus simple), envoyer un message contenant un mot-clé de `DANGER_KEYWORDS` via le vrai formulaire ou une requête POST équivalente, puis vérifier directement en base (`@supabase/supabase-js`, script Node ad hoc supprimé après usage, ou `supabase db` local) que `is_priority` est passé à `true` pour cette conversation.
  - [x] Comparer le HTML/l'accusé affiché à l'Élève entre ce cas et un message ordinaire sans mot-clé : doivent être indiscernables (mêmes accusés possibles de `ACCUSES_RECEPTION`, aucun texte/élément supplémentaire).
  - [x] Test négatif : envoyer un message sans mot-clé sur une conversation neuve → vérifier que `is_priority` reste `false`.
  - [x] Test de non-régression AC #4 : sur la conversation déjà priorisée par le test ci-dessus, envoyer un second message **sans** mot-clé de danger → vérifier que `is_priority` reste `true` après ce second envoi (ne doit jamais repasser à `false`).
  - [x] Nettoyer toute conversation de test créée pendant la vérification (même discipline que Story 2.1 — pas de donnée résiduelle).
  - [x] Rendu mobile/desktop : sans objet pour cette story (aucun changement visuel, AC #2 l'impose explicitement).

## Dev Notes

- **Contrainte centrale, plus importante que le mécanisme de détection lui-même (AC #2, AD-6)** : `app/discussion-anonyme/page.tsx` ne doit **jamais** dépendre du résultat de la détection. C'est une règle architecturale explicite (AD-6, dernière phrase) issue directement de la décision de Charles du 2026-07-10 qui a aussi annulé l'ex-Story 2.1 (bandeau permanent) : l'Élève ne doit voir aucun numéro d'urgence nulle part dans le produit, jamais, même sur détection positive. Toute tentation d'ajouter un indicateur, même discret, côté Élève doit être refusée — ce n'est pas un oubli de cette story mais une décision produit ferme. [Source: 2-1-bandeau-permanent-de-numeros-durgence.md, Change Log 2026-07-10]
- **`app/discussion-anonyme/actions.ts` — état actuel lu en entier.** `envoyerMessage(conversationId, _prevState, formData)` : valide `message` (non vide, ≤ `MESSAGE_MAX_LENGTH`) → récupère la conversation (`select id, is_ephemeral, session_token_hash`) → si non éphémère, vérifie le cookie de session contre `session_token_hash` (`verifySecret`) → insère le message (`sender_type: "eleve"`) → retourne `{ error: null, accuse: getAccuseReceptionAleatoire() }`. Toute erreur à n'importe quelle étape retourne `ERREUR_GENERIQUE_ENVOI` générique, jamais de détail technique à l'Élève. Cette story insère le calcul de `signalDanger` avant l'appel Supabase de récupération de conversation, et la mise à jour conditionnelle de `is_priority` juste après l'insertion du message — sans modifier le comportement d'erreur existant.
- **Ne pas confondre `is_priority` et l'alerte Telegram (FR-10 complet).** Cette story ne fait **que** le marquage en base — epics.md est explicite : *"la partie 'notifier les deux organisateurs sur Telegram' de FR-10 est terminée dans l'Epic 3, une fois le canal Telegram construit — cette epic [2] se limite au marquage prioritaire en base, sans affichage élève d'aucune sorte, sans dépendre d'une story future."* `lib/telegram.ts` n'existe pas encore dans le dépôt et ne doit **pas** être créé par cette story — ne pas anticiper l'Epic 3. [Source: epics.md#Epic-2 description ; ARCHITECTURE-SPINE.md Capability Map "Notification (FR-7) → lib/telegram.ts"]
- **Aucune migration Supabase nécessaire.** `is_priority boolean not null default false` et `flagged_missed_danger boolean not null default false` existent déjà sur `conversations` depuis la toute première migration (`20260708000000_conversations_and_messages.sql`, Story 1.1) — elles ont été anticipées dès le modèle de données initial. Créer une nouvelle migration pour ces colonnes serait une erreur (colonnes dupliquées/conflit `create table if not exists`, qui ne rejouerait de toute façon rien sur une table existante). [Source: supabase/migrations/20260708000000_conversations_and_messages.sql]
- **Liste de mots-clés = décision produit ouverte, pas un détail d'implémentation à figer silencieusement.** Le PRD (§4.5, §8) qualifie explicitement le mécanisme de mots-clés d'hypothèse non confirmée par Charles, et prévient que "un message peut évoquer un danger sans utiliser les mots-clés attendus (faux négatif)" (UJ-4, cas limite) — c'est pourquoi FR-9 prévoit déjà `flagged_missed_danger` pour une revue régulière (SM-2bis). Livrer une liste de départ raisonnable ne bloque pas cette story (même précédent que les numéros d'urgence de l'ex-Story 2.1, livrés non validés puis retirés sur décision produit ultérieure) — mais ce point doit être signalé à Charles à la fin de cette story, avant `dev-story`, pas découvert après coup.
- **Convention "fail-open, ne jamais bloquer l'Élève" (NFR-2), déjà établie dans tout le fichier.** `isRecoveryLocked`/`recordRecoveryAttempt` (`lib/session.ts`) retournent des valeurs sûres par défaut sur erreur Supabase plutôt que de faire échouer la requête de l'Élève. La mise à jour de `is_priority` de cette story suit la même discipline : un échec de cette écriture spécifique ne doit jamais transformer un envoi de message par ailleurs réussi en erreur visible côté Élève.
- **Logs & confidentialité (Architecture Spine, Consistency Conventions) : non négociable.** Aucun log ajouté par cette story ne doit contenir le contenu du message ni un extrait de celui-ci — seulement `conversationId` et l'objet d'erreur Supabase le cas échéant, comme le fait déjà chaque `console.error` existant du fichier.
- **Convention de style du dépôt** : commentaires en français expliquant le POURQUOI (pas le QUOI), JSDoc uniquement sur les fonctions exportées de `lib/` avec logique non triviale (voir `lib/session.ts`, `lib/accuse-reception.ts`) — reproduire ce style pour `lib/danger-keywords.ts`.

### Previous Story Intelligence

- **Story 2.1 (annulée, 2026-07-10)** — la story précédente numérotée dans l'Epic 2, entièrement implémentée puis revertée avant tout commit. Sa leçon la plus importante pour cette story : la décision produit qui l'a annulée (l'Élève ne doit jamais voir de numéro d'urgence) est exactement la contrainte de l'AC #2 ci-dessus. Le fichier `emergency-banner.tsx` qu'elle avait créé a été supprimé — ne pas le recréer, ne pas y faire référence, ne rien afficher de similaire même conditionnellement à `signalDanger`. [Source: 2-1-bandeau-permanent-de-numeros-durgence.md]
- **Story 1.5 (dernière story réellement livrée en base de code, commit `9b5e3c7`)** — a établi le rituel de vérification désormais attendu pour toute story touchant `actions.ts` : lecture complète du fichier avant modification (fait ci-dessus), vérification par requêtes réelles contre `next dev` déjà lancé (pas de redémarrage), `npm run lint`/`npm run build` systématiques, et nettoyage de toute donnée de test créée pendant la vérification. Cette story suit le même rituel (Task 3).

### Git Intelligence

- Les 5 derniers commits (`a410797`, `154c1c1`, `9b5e3c7`, `0ac14ab`, `4ba6e2f`) couvrent la clôture de l'Epic 1, la création puis l'annulation de la Story 2.1, et la mise à jour du PRD/epics/architecture (retrait FR-8, révision FR-10) — **aucun commit n'a encore touché `lib/danger-keywords.ts` ni la logique de détection dans `actions.ts`** : cette story est la première à toucher réellement FR-9/FR-10 dans le code.
- Convention de message de commit observée : `Story X.Y: <titre court>`, puis `(review appliquée)` ou `(review)` en suffixe si une correction de revue a été appliquée séparément.

### Project Structure Notes

Fichier à créer :
- `lib/danger-keywords.ts` — `DANGER_KEYWORDS` (liste versionnée) + `containsDangerSignal()` (Task 1). Emplacement conforme à l'Architecture Spine (Capability Map : "Détection danger (FR-9) → `lib/danger-keywords.ts` → gouverné par AD-6").

Fichier à modifier :
- `app/discussion-anonyme/actions.ts` — `envoyerMessage` uniquement (Task 2). Conforme à la Capability Map ("Alerte silencieuse aux organisateurs (FR-10) → `app/discussion-anonyme/actions.ts` + `lib/telegram.ts`" — la partie `lib/telegram.ts` reste hors périmètre de cette story, voir Dev Notes).

Fichiers explicitement **non créés/non modifiés**, à ne pas anticiper :
- `lib/telegram.ts` — Epic 3, canal Telegram pas encore construit.
- `app/discussion-anonyme/{page.tsx,message-form.tsx,conversation-thread.tsx,mode-choice.tsx,recovery-form.tsx}` — aucun changement de présentation (AC #2).
- Toute nouvelle migration Supabase — colonnes déjà présentes (voir Dev Notes).

Aucune variance détectée par rapport à l'arborescence de référence de l'Architecture — l'emplacement de `lib/danger-keywords.ts` correspond exactement à la Capability Map.

### References

- [Source: epics.md#Epic-2, Story-2.2 (`[RÉVISÉ, 2026-07-10]`)] — story source, AC épics, description de périmètre (marquage en base seulement, pas de Telegram)
- [Source: prd.md#FR-9 (§4.5)] — détection par mots-clés, liste révisable, cas limite faux négatif (UJ-4)
- [Source: prd.md#FR-10 (§4.5), `[RÉVISÉ 2026-07-10]`] — alerte silencieuse, aucun affichage Élève, conséquences testables
- [Source: prd.md §5, Non-Goals] — pas de détection par IA/ML
- [Source: prd.md §8, Questions ouvertes #1] — mécanisme de mots-clés non validé avec Charles
- [Source: ARCHITECTURE-SPINE.md AD-6] — détection = correspondance simple, fichier de config, page.tsx ne doit jamais dépendre du résultat
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — FR-9 → `lib/danger-keywords.ts` ; FR-10 → `app/discussion-anonyme/actions.ts` + `lib/telegram.ts` (Epic 3)
- [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions] — logs sans contenu de message
- [Source: supabase/migrations/20260708000000_conversations_and_messages.sql] — colonnes `is_priority`/`flagged_missed_danger` déjà existantes
- [Source: app/discussion-anonyme/actions.ts] — état actuel de `envoyerMessage`, point d'insertion identifié
- [Source: lib/session.ts, lib/accuse-reception.ts] — conventions de style (commentaires, fail-open) à reproduire
- [Source: 2-1-bandeau-permanent-de-numeros-durgence.md, Change Log] — décision produit du 2026-07-10 à l'origine de l'AC #2

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur.
- `npm run build` (Next.js/Turbopack, avec le vrai `.env.local`) : compilation et typecheck réussis, route `/discussion-anonyme` toujours dynamique (ƒ).
- `grep -rn "signalDanger\|is_priority\|containsDangerSignal" app/discussion-anonyme/page.tsx app/discussion-anonyme/message-form.tsx app/discussion-anonyme/conversation-thread.tsx` → aucune correspondance (AC #2 confirmé statiquement).
- Vérification par script Node ad hoc (`@supabase/supabase-js`, contre le vrai projet Supabase du `.env.local`, importé directement `lib/danger-keywords.ts` via le support natif de Node 24 pour le TypeScript — pas une réimplémentation séparée de la logique) : script placé temporairement à la racine du projet (pour la résolution de `node_modules`), exécuté, puis supprimé. Trois cas rejouant exactement la séquence de `envoyerMessage` (détection → insertion du message → mise à jour conditionnelle de `is_priority`) :
  1. Conversation neuve + message contenant "je veux me suicider ce soir" → détection positive, `is_priority` passe de `false` à `true`.
  2. Même conversation + message suivant sans mot-clé ("merci pour ta réponse, à bientôt") → détection négative, `is_priority` reste `true` (non-régression AC #4 — jamais réécrit à `false`).
  3. Conversation neuve + message sans mot-clé ("salut, comment ça va au lycée ?") → détection négative, `is_priority` reste `false`.
  Les 2 conversations de test (et leurs messages, cascade FK) ont été supprimées immédiatement après (`conversations.delete()`), aucune donnée résiduelle.
- Vérification manuelle du code du retour de `envoyerMessage` : `return { error: null, accuse: getAccuseReceptionAleatoire() }` reste strictement identique que `signalDanger` soit `true` ou `false` — aucune branche conditionnelle sur le résultat de la détection dans la valeur retournée (AC #2, #7 confirmés par lecture directe, pas seulement par grep).
- Non testé via une vraie requête HTTP POST contre le formulaire réel (`useActionState`/protocole d'action serveur de Next.js) : la vérification par script rejouant la séquence exacte contre la vraie base Supabase a été jugée suffisante et plus fiable qu'une reconstruction manuelle du protocole d'encodage des Server Actions via `curl` — même choix méthodologique que la Story 1.3 (vérification par script ad hoc "en l'absence d'outil de test automatisé dans ce projet").

**Revue de code (code-review, effort élevé, 8 angles + vérification à 1 vote) et corrections appliquées :**
- 3 findings retenus sur candidats initiaux plus nombreux (plusieurs REFUTED après vérification, notamment un risque de double-envoi lié à `is_priority` — REFUTED avec preuve : `@supabase/supabase-js` ne lève jamais d'exception sans `.throwOnError()` explicite, absent ici, donc toujours résolu en `{error}`, jamais en rejet).
- Les 3 findings retenus (accents/faux négatif, latence évitable, mots-clés redondants) ont été corrigés — voir "Review Findings" sous Tasks/Subtasks ci-dessus.
- Après corrections : `npm run lint` et `npm run build` de nouveau au vert ; le script de vérification ad hoc (3 cas contre la vraie base Supabase) rejoué à l'identique, toujours au vert ; `grep` de non-régression sur les composants de présentation toujours vide ; page `/discussion-anonyme` toujours réponse `200`.

### Completion Notes List

- Tasks 1 à 3 entièrement implémentées et vérifiées : `lib/danger-keywords.ts` créé (liste de mots-clés de départ non validée cliniquement + `containsDangerSignal`), `envoyerMessage` (`actions.ts`) modifié pour détecter avant écriture et marquer `is_priority` uniquement sur détection positive, sans jamais l'écrire à `false`.
- Les 7 AC sont satisfaits : #1 (détection avant écriture, fonction pure sans I/O placée avant le premier appel Supabase), #2 (aucune dépendance de `page.tsx`/`message-form.tsx`/`conversation-thread.tsx` à la détection, accusé identique dans tous les cas), #3 (colonne déjà existante, pas de nouvelle migration), #4 (non-régression vérifiée par script : `is_priority` ne repasse jamais à `false`), #5 (liste dans `lib/danger-keywords.ts`, aucune dépendance réseau/IA), #6 (`flagged_missed_danger` non touché), #7 (`EnvoyerMessageState` inchangé, aucun champ ajouté).
- Aucun fichier de présentation modifié (`page.tsx`, `message-form.tsx`, `conversation-thread.tsx`, `mode-choice.tsx`, `recovery-form.tsx` tous inchangés) — conforme aux Dev Notes et au Project Structure Notes.
- Aucune migration Supabase créée — colonnes déjà présentes depuis la Story 1.1, confirmé par lecture de `supabase/migrations/20260708000000_conversations_and_messages.sql` avant implémentation.
- `lib/telegram.ts` non créé — hors périmètre de cette story (Epic 3), conformément aux Dev Notes.
- **Point ouvert non résolu par cette story, à signaler explicitement à Charles** : la liste `DANGER_KEYWORDS` de `lib/danger-keywords.ts` est une hypothèse de départ non validée cliniquement (aucune liste de référence dans les artefacts de planification) — à réviser avant tout lancement public, comme convenu pour la liste de numéros d'urgence de l'ex-Story 2.1.

### File List

- `lib/danger-keywords.ts` (créé — `DANGER_KEYWORDS`, `containsDangerSignal`)
- `app/discussion-anonyme/actions.ts` (modifié — `envoyerMessage` : import de `containsDangerSignal`, calcul de `signalDanger` avant tout appel Supabase, mise à jour conditionnelle de `conversations.is_priority` après l'insertion du message)

## Change Log

- 2026-07-10 : Story créée (create-story). Sprint status corrigé au passage : `2-1-bandeau-permanent-de-numeros-durgence` était resté marqué `backlog` alors qu'epics.md et le fichier de story documentent son annulation depuis le 2026-07-10 — statut mis à `cancelled` dans `sprint-status.yaml` pour que la découverte automatique de la prochaine story n'essaie plus de la reprendre. Point ouvert signalé à Charles : la liste de mots-clés de `lib/danger-keywords.ts` est une hypothèse de départ non validée cliniquement (voir Dev Notes) — à réviser avant tout lancement public, comme convenu pour la liste de numéros de l'ex-Story 2.1.
- 2026-07-10 : Implémentation complète (dev-story) — `lib/danger-keywords.ts` créé, `envoyerMessage` modifié pour détecter avant écriture et marquer `is_priority` uniquement sur détection positive (jamais réécrit à `false`). Vérifié par `lint`/`build`, par lecture statique/grep confirmant l'absence totale de dépendance côté présentation, et par script Node ad hoc rejouant la séquence exacte contre le vrai projet Supabase (3 cas : détection positive, non-régression sur message suivant sans mot-clé, détection négative sur conversation neuve — les 2 conversations de test supprimées après coup). Les 7 AC et les 3 Tasks sont satisfaits — passage en `review`. Point ouvert non résolu, à trancher avec Charles avant tout lancement public : la liste de mots-clés de danger n'a aucune source validée dans les artefacts de planification.
- 2026-07-10 : Revue de code (code-review) — 3 findings retenus après vérification (faux négatif possible sur mots-clés accentués, latence évitable sur `is_priority`, mots-clés redondants), tous corrigés (voir "Review Findings"). `lint`/`build`/script de vérification Supabase rejoués avec succès après corrections. Passage en `done`.
