---
baseline_commit: 2f897adddfa57623abd38ab546d275b49fc3ac20
---

# Story 1.3: Envoi du premier message et accusé de réception

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève ayant choisi mon mode,
I want écrire et envoyer mon message et recevoir une confirmation immédiate,
so that je sais que mon message est bien parti sans attendre une réponse humaine.

## Acceptance Criteria

1. Given j'ai terminé la divulgation (Story 1.1) et le choix de mode (Story 1.2), When j'écris un message dans le champ prévu et clique "Envoyer", Then le message est enregistré en base (`messages`, `sender_type='eleve'`) et associé à la Conversation créée en Story 1.2, sans aucun champ d'identité (nom/email/identifiant). [Source: prd.md#FR-1, epics.md#Story-1.3]
2. L'envoi fonctionne aussi bien sur mobile que sur desktop (réutilise les gabarits responsive déjà validés en Story 1.1/1.2). [Source: prd.md#FR-1]
3. Given j'envoie un message (mode Sauvegarder ou Éphémère), When l'envoi réussit, Then un accusé de réception s'affiche en moins de 2 secondes, texte choisi aléatoirement parmi plusieurs variantes pré-écrites (pas d'appel à un service d'IA externe), qui ne promet jamais une réponse "immédiate"/"instantanée". [Source: prd.md#FR-3, ARCHITECTURE-SPINE.md#AD-11]
4. Given je suis en mode "Sauvegarder" (cookie `session_token` posé en Story 1.2), When j'envoie un message, Then la Server Action vérifie elle-même que ce cookie correspond bien à la Conversation ciblée avant d'enregistrer le message — une tentative avec l'identifiant d'une autre Conversation "Sauvegarder" est refusée. [Source: ARCHITECTURE-SPINE.md#AD-3, #AD-4]
5. Given je suis en mode "Éphémère" (aucun cookie, Story 1.2/FR-19), When j'envoie un message, Then il est enregistré normalement (comme AC #1) sans qu'aucune vérification de cookie ne soit requise — cohérent avec l'absence de session persistante de ce mode. [Source: prd.md#FR-19]

## Tasks / Subtasks

- [x] Task 1: Créer `lib/accuse-reception.ts` — variantes pré-écrites (AC: #3)
  - [x] Exporter un tableau `ACCUSES_RECEPTION: string[]` d'au moins 3 variantes de texte chaleureuses, qui confirment la bonne réception et fixent un délai honnête (ex. "dans la journée", "on est aussi au lycée toute la semaine") — **jamais** "immédiat"/"instantané"
  - [x] Exporter une fonction `getAccuseReceptionAleatoire(): string` qui tire une variante au hasard (`Math.random()` suffit, pas un enjeu de sécurité)
  - [x] Ne pas appeler d'API externe (OpenAI, Anthropic, etc.) — ceci **résout** l'hypothèse `[ASSUMPTION]` encore ouverte dans le PRD (§4.2, FR-3) dans le sens tranché par l'Architecture (AD-11) : texte pré-écrit, pas d'IA

- [x] Task 2: Étendre `app/discussion-anonyme/actions.ts` (AC: #1, #4, #5)
  - [x] Modifier l'insertion dans `choisirModeSauvegarder` pour récupérer l'`id` généré (`.insert({...}).select("id").single()`) et l'inclure dans la redirection : `redirect(\`/discussion-anonyme?etape=pret&conv=${data.id}\`)`
  - [x] Modifier `choisirModeEphemere` de la même façon (récupérer l'`id`, l'inclure dans `redirect(\`/discussion-anonyme?etape=pret&mode=ephemere&conv=${data.id}\`)`)
  - [x] Créer la Server Action `envoyerMessage(conversationId: string, prevState: EnvoyerMessageState, formData: FormData)` :
    - Lit et valide le message (`.trim()`, refuse si vide — retourne un état d'erreur exploitable par `useActionState`, jamais une exception non gérée)
    - Récupère la Conversation ciblée (`select id, is_ephemeral, session_token_hash from conversations where id = conversationId`) — si absente, retourne une erreur générique
    - **Si `is_ephemeral === false`** (mode Sauvegarder) : lit le cookie `session_token` (`await cookies()`), et vérifie qu'il correspond au `session_token_hash` de **cette** Conversation précise via `verifySecret` (import depuis `lib/session.ts`) — un seul `bcrypt.compare`, pas la boucle O(n) de `isCodeAvailable` (ici on connaît déjà l'id, donc pas besoin de chercher). Cookie absent ou ne correspondant pas → erreur générique, aucun message inséré. C'est le garde-fou qui empêche qu'un `conv` manipulé dans l'URL permette d'injecter un faux message dans la Conversation sauvegardée d'quelqu'un d'autre.
    - **Si `is_ephemeral === true`** : aucune vérification de cookie possible ni nécessaire (le mode éphémère n'a par conception aucune session persistante, AD-5) — insérer directement. C'est une limite acceptée du mode éphémère, pas un bug à corriger dans cette story.
    - Insère le message (`sender_type: 'eleve'`, `body`, `conversation_id: conversationId`)
    - Choisit un accusé de réception (`getAccuseReceptionAleatoire()`) et le retourne dans l'état (`{ error: null, accuse: "..." }`) pour affichage immédiat côté client sans recharger la page
  - [x] Chaque Server Action continue de vérifier elle-même tout ce dont elle a besoin, sans supposer qu'une validation a eu lieu côté page (AD-3, déjà appliqué en Story 1.2)

- [x] Task 3: Créer `app/discussion-anonyme/message-form.tsx` — Client Component (AC: #1, #2, #3)
  - [x] `"use client"`, reçoit `conversationId: string` en prop
  - [x] `useActionState(envoyerMessage.bind(null, conversationId), initialState)` — pattern de Server Action avec argument lié (nouveau dans ce projet ; voir Dev Notes)
  - [x] `<textarea>` + bouton "Envoyer", styles Tailwind cohérents avec `mode-choice.tsx` (bordures arrondies, dark mode, `disabled` pendant `isPending`)
  - [x] Après succès (`state.accuse` renseigné) : afficher le texte de l'accusé sous le formulaire, vider le champ, garder le formulaire actif pour permettre l'envoi d'un message suivant (le modèle de données autorise plusieurs messages par Conversation) — mais **ne pas** construire d'affichage de l'historique des messages ou des réponses reçues ici (voir "Fichiers non créés")
  - [x] Afficher l'erreur (`state.error`) avec `role="alert"`, comme dans `mode-choice.tsx`

- [x] Task 4: Modifier `app/discussion-anonyme/page.tsx` (AC: #1, #2, #3)
  - [x] Lire `conv` en plus de `etape`/`mode` dans `searchParams`
  - [x] Si `etapePrete && conv` : remplacer le placeholder statique actuel ("La suite arrive juste après") par `<MessageForm conversationId={conv} />`
  - [x] Si `etapePrete` mais `conv` absent/vide (URL modifiée à la main, navigation incohérente) : `redirect("/discussion-anonyme")` pour repartir proprement de la divulgation/choix de mode plutôt que de planter — garde-fou minimal, ne pas construire ici la vraie logique de retour par cookie (Story 1.4)
  - [x] Ne pas toucher au texte de divulgation (Story 1.1) ni à l'écran de choix de mode (Story 1.2)

- [x] Task 5: Vérification manuelle (AC: #1, #2, #3, #4, #5)
  - [x] Parcours "Sauvegarder" : créer un Code, envoyer un message, vérifier en Table Editor que la ligne `messages` a le bon `conversation_id`/`sender_type='eleve'`/`body`, et que l'accusé s'affiche quasi instantanément
  - [x] Parcours "Éphémère" : envoyer un message sans cookie, vérifier qu'il est bien inséré malgré l'absence de session
  - [x] Test de sécurité : en mode "Sauvegarder", modifier manuellement `conv` dans l'URL pour pointer vers une autre Conversation "Sauvegarder" existante (ou un id inexistant) → l'envoi doit être refusé avec une erreur générique, aucun message inséré
  - [x] Vérifier qu'aucun texte de message ni contenu sensible n'apparaît dans les logs serveur (uniquement métadonnées si besoin)
  - [x] Vérifier sur mobile et desktop que le formulaire et l'accusé restent lisibles et utilisables — confirmé par Charles le 2026-07-09 sur `http://localhost:3000/discussion-anonyme`

## Dev Notes

- **Le vrai problème non résolu par l'Architecture, que cette story doit trancher** : après la Story 1.2, l'élève arrive sur l'état placeholder `?etape=pret`, mais rien ne relie ce placeholder à l'`id` de la Conversation qu'il vient de créer — le cookie `session_token` existe (mode Sauvegarder) mais la Story 1.2 précise explicitement que "la lecture du cookie au retour" (recherche par comparaison bcrypt façon `isCodeAvailable`) est le sujet de la **Story 1.4**, pas de celle-ci. Cette story n'est pourtant pas un "retour" : c'est la suite immédiate, dans le même onglet, de la création qui vient d'avoir lieu — l'id est donc déjà connu à cet instant, pas besoin de le rechercher. Solution retenue ici : transporter l'`id` de la Conversation fraîchement créée via le paramètre d'URL `conv` (ajouté aux deux redirections existantes dans `actions.ts`), pas via une nouvelle recherche par cookie. Ça évite de dupliquer par anticipation la logique O(n) de la Story 1.4. [Source: 1-2-choix-du-mode-de-conversation-sauvegarder-ou-ephemere.md, Dev Notes]
- **Pourquoi vérifier quand même le cookie dans `envoyerMessage` (mode Sauvegarder)** : le paramètre `conv` dans l'URL n'est pas un secret (un uuid n'est pas plus sensible qu'un numéro de ticket), mais sans vérification, n'importe qui connaissant/devinant cet id pourrait injecter un message dans la Conversation sauvegardée d'un autre élève. La vérification est un `bcrypt.compare` **unique** contre le `session_token_hash` de la Conversation déjà identifiée par `conv` — pas la boucle `isCodeAvailable` (qui, elle, doit comparer contre *toutes* les Conversations faute de connaître l'id à l'avance). Le mode Éphémère n'a par construction aucun secret équivalent à vérifier (AD-5) : c'est une limite assumée du mode, pas un défaut à corriger ici. [Source: ARCHITECTURE-SPINE.md#AD-3, #AD-4, #AD-5]
- **AD-11 tranche l'hypothèse ouverte du PRD** : le PRD (§4.2, FR-3) marque encore `[ASSUMPTION]` "généré ou assisté par IA", mais l'Architecture (AD-11) a depuis résolu ce point dans le sens le plus simple : texte pré-écrit choisi aléatoirement dans `lib/`, **aucun appel à un service d'IA externe**. Suivre AD-11, pas la formulation du PRD — ne pas introduire de dépendance à une API d'IA tierce (contredirait aussi AD-2, stack verrouillée). [Source: ARCHITECTURE-SPINE.md#AD-11]
- **Nouveau pattern React/Next dans ce projet : Server Action avec argument lié (`bind`)** : `useActionState` attend une fonction `(prevState, formData)`, mais `envoyerMessage` a aussi besoin de `conversationId`. Pattern standard React 19/Next.js : `useActionState(envoyerMessage.bind(null, conversationId), initialState)` côté client, avec `envoyerMessage(conversationId, prevState, formData)` côté serveur — le premier argument lié n'apparaît pas dans le `formData`. La Story 1.2 n'avait pas ce besoin (`choisirModeSauvegarder` ne prend que `prevState`/`formData`) ; c'est la première fois que ce pattern apparaît dans le projet. [Source: recherche web, React 19 / Next.js Server Actions docs — passing additional arguments via bind]
- **Portée volontairement limitée** : cette story affiche uniquement l'accusé de réception du dernier message envoyé, pas un historique de fil de conversation ni les réponses des organisateurs — afficher "ma conversation et les réponses reçues" est explicitement le sujet de la Story 1.4 (retour via cookie) et 1.5 (retour via Code). Ne pas construire de vue de thread ici.
- **Conventions transverses toujours valables** : ids en `uuid`, dates en `timestamptz`, aucune PII élève stockée, aucun contenu de message ni secret (cookie/Code) dans les logs serveur. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Pas de nouvelle dépendance** : réutilise `@supabase/supabase-js`, `bcryptjs` (déjà installés en Story 1.1/1.2), aucune bibliothèque supplémentaire nécessaire pour cette story.
- **Pas de framework de test** (toujours absent du tableau Stack) — vérification manuelle uniquement, comme pour les Stories 1.1 et 1.2. Ne pas introduire Jest/Vitest/Playwright silencieusement.
- **Longueur du message** : ni le PRD ni l'Architecture ne fixent de borne. Ajouter une limite haute raisonnable côté validation serveur (ex. quelques milliers de caractères) est un garde-fou pragmatique de bon sens, pas une exigence spécifiée — rester simple (`maxLength` sur le `<textarea>` suffit), ne pas construire de logique de troncature élaborée.
- **Historique git** : à ce jour, seuls les commits de bootstrap (Story 1.1, commit `a54143a`) sont poussés sur `main` ; le travail de la Story 1.2 (`lib/session.ts`, `actions.ts`, `mode-choice.tsx`, modification de `page.tsx`) est présent dans l'arborescence locale mais pas encore commité (story au statut "review"). Cette story 1.3 part de cet état de travail existant, pas d'un commit propre — les fichiers `actions.ts`/`page.tsx` à modifier sont ceux lus directement dans l'arborescence courante, pas une version reconstituée depuis git.

### Project Structure Notes

Fichiers à créer par cette story :
- `lib/accuse-reception.ts` — variantes pré-écrites + tirage aléatoire (Task 1)
- `app/discussion-anonyme/message-form.tsx` — Client Component du formulaire d'envoi (Task 3)

Fichiers à modifier :
- `app/discussion-anonyme/actions.ts` — ajout de `envoyerMessage`, capture de l'`id` de Conversation dans les deux redirections existantes (Task 2)
- `app/discussion-anonyme/page.tsx` — lecture de `conv`, rendu de `MessageForm` en remplacement du placeholder (Task 4)

Fichiers **non créés/non touchés** dans cette story, à ne pas anticiper :
- `lib/danger-keywords.ts`, `lib/telegram.ts` — Epic 2/3
- Affichage de l'historique des messages / réponses organisateur, lecture du cookie au retour — Story 1.4
- Vérification de Code pour récupération multi-appareil — Story 1.5
- `supabase/migrations/` — aucune nouvelle table nécessaire, `messages` existe déjà depuis la Story 1.1

Aucune variance détectée par rapport à l'arborescence de référence de l'Architecture.

### References

- [Source: prd.md#FR-1 (§4.1)] — envoi anonyme, aucun champ d'identité, mobile/desktop
- [Source: prd.md#FR-3 (§4.2)] — accusé de réception < 2s, délai honnête, jamais "immédiat"
- [Source: prd.md#FR-19 (§4.1)] — mode éphémère : message transmis normalement, sans cookie
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions, auto-vérification de l'autorisation
- [Source: ARCHITECTURE-SPINE.md#AD-4] — aucun accès client direct à Supabase
- [Source: ARCHITECTURE-SPINE.md#AD-5] — session_token/Code bcrypt, mode éphémère sans session persistante
- [Source: ARCHITECTURE-SPINE.md#AD-11] — accusé de réception pré-écrit, pas d'IA externe
- [Source: ARCHITECTURE-SPINE.md, Modèle de données] — table `messages` (`sender_type`, `body`, `conversation_id`)
- [Source: epics.md#Epic-1, Story-1.3] — story source
- [Source: 1-2-choix-du-mode-de-conversation-sauvegarder-ou-ephemere.md] — pattern Server Action/useActionState établi, limite de la recherche par cookie différée à la Story 1.4
- [Source: recherche web 2026-07-08] — Server Actions avec argument lié (`.bind`) combinées à `useActionState` (React 19 / Next.js)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- Le code des Tasks 1 à 4 existait déjà dans l'arbre de travail avant cette session : commité par anticipation dans la Story 1.2 (commit `27e2d3d`, message : "Inclut message-form.tsx et lib/accuse-reception.ts (Story 1.3, en cours) car page.tsx/actions.ts en dépendent déjà pour compiler ; la Story 1.3 elle-même sera revue séparément."). Cette session a donc porté sur la revue/vérification de ce code existant par rapport aux ACs et Tasks de cette story, pas sur une réécriture.
- `npm run lint` : succès, 0 erreur.
- `npm run build` (Next.js/Turbopack, avec le vrai `.env.local`) : compilation et typecheck réussis, route `/discussion-anonyme` toujours dynamique (ƒ).
- Vérification par script Node ad hoc (`@supabase/supabase-js` + `bcryptjs`, contre le vrai projet Supabase du `.env.local`) rejouant la logique exacte d'`envoyerMessage` : (1) message inséré avec le bon cookie sur sa propre Conversation "Sauvegarder" → OK ; (2) même cookie présenté contre l'id d'une **autre** Conversation "Sauvegarder" (simulation de manipulation de `conv` dans l'URL) → refusé ; (3) aucun cookie présenté contre une Conversation "Sauvegarder" → refusé ; (4) Conversation éphémère sans aucun cookie → message inséré normalement ; (5) colonnes de `messages` vérifiées (`id, conversation_id, sender_type, body, created_at`) — aucune colonne d'identité. Les 5 lignes de test (2 conversations + 1 conversation éphémère + 2 messages) ont été supprimées immédiatement après (script auto-nettoyant).
- Revue statique des logs serveur (`actions.ts`) : le seul `console.error` existant (échec de création de conversation éphémère) ne logue que l'erreur Postgres, jamais le contenu d'un message.
- Rendu visuel mobile/desktop du formulaire et de l'accusé : **confirmé par Charles le 2026-07-09** sur `http://localhost:3000/discussion-anonyme` (serveur relancé par l'agent après l'incident ci-dessous) — lisible et utilisable, aucun problème signalé.
- Incident mineur en cours de session : une commande `pkill -f "next dev" -o` destinée à arrêter un serveur `next dev` dupliqué (lancé par erreur par l'agent sur le port 3001) a en réalité arrêté le serveur `next dev` que Charles avait déjà lancé lui-même sur le port 3000 (le flag `-o` cible le processus le *plus ancien*, pas le plus récent). Corrigé immédiatement en relançant `npm run dev` (à nouveau sur le port 3000).

### Completion Notes List

- Aucun nouveau code écrit par l'agent dans cette session : `lib/accuse-reception.ts`, `app/discussion-anonyme/actions.ts` (fonction `envoyerMessage` + capture de l'`id` dans les deux redirections), `app/discussion-anonyme/message-form.tsx` et `app/discussion-anonyme/page.tsx` (lecture de `conv`, rendu de `MessageForm`, redirection si `conv` manquant) existaient déjà, écrits en amont pendant la Story 1.2 pour permettre au projet de compiler.
- Cette session a vérifié que ce code existant satisfait bien chaque AC et sous-tâche de cette story (Tasks 1 à 4), corrigé aucune non-conformité (aucune trouvée), et exécuté la vérification de sécurité de l'AC #4 (garde-fou anti-manipulation de `conv`) par script contre le vrai projet Supabase plutôt qu'à la main dans le navigateur, en l'absence d'outil de test automatisé dans ce projet.
- Task 5 est désormais entièrement cochée : vérifications par script/lecture de code (agent) + confirmation visuelle mobile/desktop (Charles, 2026-07-09).
- Les 5 AC sont satisfaits : #1, #4, #5 vérifiés par script contre la vraie base Supabase ; #2, #3 confirmés visuellement par Charles.

### File List

- `lib/accuse-reception.ts` (déjà présent, revu — aucune modification)
- `app/discussion-anonyme/actions.ts` (déjà présent, revu — aucune modification ; contient déjà `envoyerMessage` et la capture de l'`id` dans les deux redirections)
- `app/discussion-anonyme/message-form.tsx` (déjà présent, revu — aucune modification)
- `app/discussion-anonyme/page.tsx` (déjà présent, revu — aucune modification)

## Change Log

- 2026-07-09 : Revue et vérification de la Story 1.3 — le code (Tasks 1 à 4) avait déjà été écrit par anticipation pendant la Story 1.2 pour permettre au projet de compiler. Vérifié par `lint`/`build` et par script contre le vrai projet Supabase que le garde-fou anti-manipulation de `conv` (AC #4), le mode éphémère (AC #5) et l'absence de PII (AC #1) fonctionnent réellement, avec nettoyage des données de test. Rendu mobile/desktop confirmé par Charles. Les 5 tasks et les 5 AC sont satisfaits — passage en `review`.
