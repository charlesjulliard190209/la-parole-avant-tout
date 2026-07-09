---
baseline_commit: 4ba6e2f4c779955440facd51c59a4761a916c541
---

# Story 1.4: Retour automatique via le navigateur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève qui a sauvegardé ma conversation et qui reviens sur le même appareil,
I want retrouver ma conversation automatiquement,
so that je n'ai rien à ressaisir.

## Acceptance Criteria

1. Given j'ai déjà une Conversation "Sauvegarder" liée à mon navigateur (cookie `session_token` valide), When je rouvre `/discussion-anonyme` sans paramètre d'URL particulier, Then ma conversation s'affiche directement (formulaire + historique des messages), sans repasser par la divulgation ni le choix de mode. [Source: epics.md#Story-1.4, prd.md#FR-2]
2. Given le cookie est absent (autre appareil, cache vidé, navigation privée) et qu'aucun Code n'est saisi, When j'ouvre `/discussion-anonyme`, Then le parcours existant (divulgation puis choix de mode, Stories 1.1/1.2) s'affiche normalement et une nouvelle Conversation vierge peut être créée sans erreur ni blocage — vérification de non-régression, pas de nouveau comportement à construire pour cette branche. [Source: prd.md#FR-2, epics.md#Story-1.4]
3. Given un cookie `session_token` ne correspondant à aucune Conversation "Sauvegarder" existante (cookie périmé/invalide/DB temporairement indisponible), When j'ouvre `/discussion-anonyme`, Then aucune erreur ne s'affiche — le parcours normal (divulgation + choix de mode) reprend, comme si aucun cookie n'était présent. [Source: prd.md#FR-2 conséquences]
4. Given une Conversation "Sauvegarder" retrouvée par cookie (ou en cours, juste créée), When ses messages s'affichent, Then l'historique complet (messages élève et réponses organisateur, dans l'ordre chronologique) est visible au-dessus du formulaire d'envoi. [Source: epics.md#Story-1.4, 1-3-envoi-du-premier-message-et-accuse-de-reception.md Dev Notes — "l'affichage de l'historique... est explicitement le sujet de la Story 1.4"]
5. Given un paramètre `conv` dans l'URL pointant vers une Conversation "Sauvegarder" qui n'appartient pas au cookie présent (ou sans cookie du tout), When la page se charge, Then l'historique de cette Conversation ne s'affiche PAS — redirection vers `/discussion-anonyme`, comme pour un `conv` absent, afin de ne pas exposer les messages d'un autre élève à qui devinerait/copierait un id. [Source: ARCHITECTURE-SPINE.md#AD-3, #AD-4 — extension du principe déjà appliqué en écriture (Story 1.3, AC #4) à la lecture, nécessaire pour ne pas régresser la confidentialité déjà garantie côté écriture]
6. Given une Conversation "Éphémère" (`is_ephemeral = true`), When son `conv` est dans l'URL juste après création, Then son historique s'affiche normalement sans vérification de cookie (aucun cookie n'existe par conception pour ce mode, AD-5) — comportement déjà accepté en Story 1.3, aucune régression à introduire. [Source: ARCHITECTURE-SPINE.md#AD-5, 1-3-envoi-du-premier-message-et-accuse-de-reception.md Review Findings]

## Tasks / Subtasks

- [x] Task 1: Ajouter `findConversationBySessionToken` dans `lib/session.ts` (AC: #1, #3)
  - [x] Exporter `async function findConversationBySessionToken(sessionToken: string): Promise<{ id: string } | null>`
  - [x] Requête : `conversations` avec `is_ephemeral = false` et `session_token_hash is not null`, puis boucle `bcrypt.compare` (même motif O(n) que `isCodeAvailable`, acceptable à l'échelle d'un lycée, NFR-1) — retourne le premier `id` dont le hash correspond au `sessionToken` fourni, sinon `null`
  - [x] Contrairement à `isCodeAvailable` (qui lance une erreur), cette fonction attrape elle-même toute erreur Supabase (`try/catch` interne complet) et retourne `null` plutôt que de la propager — elle sera appelée à **chaque chargement** de la page de chat par un visiteur potentiellement revenant ; un incident Supabase transitoire ne doit jamais empêcher l'affichage du parcours normal (NFR-2 : accessibilité continue du chat)

- [x] Task 2: Détection du retour par cookie dans `app/discussion-anonyme/page.tsx` (AC: #1, #2, #3)
  - [x] Avant le rendu, si `!etapePrete && !conversationId` (atterrissage "à froid" : ni `conv` ni `etape=pret` dans l'URL) : lire le cookie `session_token` via `cookies()` (`next/headers`), et si présent, appeler `findConversationBySessionToken`
  - [x] Si une Conversation est trouvée : `redirect(\`/discussion-anonyme?etape=pret&conv=${found.id}\`)`
  - [x] Si aucun cookie ou aucune correspondance : ne rien faire de spécial — le rendu existant (divulgation + choix de mode) se poursuit normalement (couvre AC #2/#3 sans code additionnel au-delà de "ne pas planter")

- [x] Task 3: Vérification d'autorisation en lecture + chargement de l'historique dans `app/discussion-anonyme/page.tsx` (AC: #4, #5, #6)
  - [x] Dans la branche `etapePrete && conversationId` (que ce `conv` vienne de la redirection Task 2, d'une redirection de création Story 1.3, ou d'une URL modifiée à la main), avant de rendre `MessageForm` :
    - Récupérer la Conversation : `select id, is_ephemeral, session_token_hash from conversations where id = conversationId` (même requête que `envoyerMessage` dans `actions.ts` — dupliquée volontairement ici car exécutée côté page/lecture, pas dans la Server Action d'envoi ; ne pas tenter de factoriser entre page et Server Action dans cette story)
    - Si absente : `redirect("/discussion-anonyme")` (étend le garde-fou déjà existant pour `conv` manquant à `conv` invalide)
    - Si `is_ephemeral === false` : lire le cookie `session_token`, vérifier avec `verifySecret` (déjà importé dans `actions.ts`, à importer aussi ici depuis `lib/session.ts`) contre le `session_token_hash` de **cette** Conversation précise ; si absent ou ne correspond pas : `redirect("/discussion-anonyme")` — ne jamais afficher l'historique d'une Conversation "Sauvegarder" qui n'appartient pas au cookie présent (AC #5)
    - Si `is_ephemeral === true` : aucune vérification (AC #6, limite déjà acceptée en Story 1.3)
  - [x] Récupérer les messages : `select id, sender_type, body, created_at from messages where conversation_id = conversationId order by created_at asc`
  - [x] Passer ces messages au composant `ConversationThread` (Task 4), rendu au-dessus de `<MessageForm conversationId={conversationId} />`

- [x] Task 4: Créer `app/discussion-anonyme/conversation-thread.tsx` (AC: #4)
  - [x] Server Component (pas de `"use client"`, aucune interactivité nécessaire), reçoit `messages: { id: string; sender_type: "eleve" | "organisateur"; body: string; created_at: string }[]` en prop
  - [x] Si la liste est vide, ne rien rendre (`return null`) — état normal juste après création d'une Conversation, avant le premier envoi
  - [x] Sinon, afficher chaque message dans l'ordre chronologique, avec une distinction visuelle claire élève / organisateur (libellé "Toi" / "L'équipe" + fond différencié, cohérent avec les styles Tailwind déjà utilisés dans `message-form.tsx`/`mode-choice.tsx`, dark mode inclus)
  - [x] Pas de scroll infini, pagination, websocket ni mise à jour temps réel construit — rendu simple au chargement de la page uniquement

- [x] Task 5: Vérification manuelle (AC: #1 à #6)
  - [x] Parcours retour "Sauvegarder" : vérifié de bout en bout par script contre le vrai projet Supabase + requêtes HTTP réelles contre le serveur `next dev` local (voir Debug Log) — une Conversation créée avec un cookie `session_token` valide, atterrissage à froid sur `/discussion-anonyme` → redirection 307 vers `?etape=pret&conv=<id>`, historique des 2 messages (élève + organisateur) affiché
  - [x] Second message depuis un fil retrouvé : non re-testé manuellement dans cette session (aucune modification de `envoyerMessage`/`MessageForm`, comportement inchangé depuis la Story 1.3, déjà vérifié dans cette story)
  - [x] Cookie absent : `curl` sans cookie sur `/discussion-anonyme` → divulgation + choix de mode affichés normalement, aucune erreur, aucune redirection (AC #2)
  - [x] Cookie ne correspondant à aucune Conversation : `findConversationBySessionToken` avec un token aléatoire jamais créé → retourne `null` sans exception (AC #3), vérifié par script direct contre Supabase
  - [x] Test de sécurité (AC #5) : Conversation B interrogée avec le cookie de la Conversation A (`?etape=pret&conv=<id-B>` + cookie de A) → redirection 307 vers `/discussion-anonyme`, aucun contenu de B dans la réponse HTML (vérifié par `curl` contre le serveur réel)
  - [x] Parcours Éphémère : Conversation éphémère créée directement en base, `/discussion-anonyme?etape=pret&conv=<id>` sans aucun cookie → historique affiché normalement (AC #6), vérifié par `curl`
  - [x] Aucun `console.log`/`console.error` ajouté par cette story (`page.tsx`, `lib/session.ts`, `conversation-thread.tsx`) — aucun risque de fuite de contenu de message dans les logs serveur
  - [x] Rendu mobile/desktop du fil de conversation (lisibilité, distinction élève/organisateur) — **confirmé par Charles le 2026-07-09** en mode responsive DevTools sur `http://localhost:3000/discussion-anonyme` (accès direct par téléphone sur le même Wi-Fi non concluant, probablement lié à l'environnement réseau de la machine de dev, contournement par l'émulation navigateur)

### Review Findings

- [x] [Review][Patch] Aucune gestion d'erreur sur les deux appels Supabase directs de `page.tsx` (lecture de la Conversation + lecture des messages) [app/discussion-anonyme/page.tsx:57-64,86-90] — contrairement à `findConversationBySessionToken` (Task 1), volontairement conçue pour ne jamais lancer d'exception (NFR-2), ces deux requêtes ne sont protégées par aucun `try/catch` et ignorent silencieusement le champ `error` (seul `data` est déstructuré). Une exception Supabase transitoire ferait planter tout le rendu de la page pour un élève qui revient légitimement ; une erreur "douce" non levée se traduit par un historique vide indiscernable d'une conversation réellement vide. **Corrigé** : les deux requêtes sont désormais enveloppées dans un `try/catch` et vérifient `error`, avec repli sur `null`/`[]` (même philosophie que `findConversationBySessionToken`).
- [x] [Review][Patch] `findConversationBySessionToken` : une erreur `bcrypt.compare` sur une ligne corrompue interrompt tout le scan [lib/session.ts:66-83] — le `try/catch` englobe toute la boucle ; si `verifySecret` lève une exception sur une ligne (hash corrompu/malformé), la fonction retourne `null` immédiatement même si la bonne correspondance existe plus loin dans la liste. Un élève avec un cookie valide pourrait être silencieusement renvoyé vers la divulgation à cause de données corrompues appartenant à une autre Conversation. **Corrigé** : le `try/catch` est désormais à l'intérieur de la boucle (par ligne), une erreur sur une ligne passe à la suivante au lieu d'abandonner tout le scan.
- [x] [Review][Patch] Tri des messages sans clé secondaire [app/discussion-anonyme/page.tsx:86-90] — `.order("created_at", { ascending: true })` seul ne garantit pas un ordre stable entre deux messages partageant le même timestamp (résolution de `timestamptz`). **Corrigé** : ajout de `.order("id", { ascending: true })` comme clé secondaire.
- [x] [Review][Patch] La détection de retour par cookie "à froid" n'exclut pas `erreur=ephemere` [app/discussion-anonyme/page.tsx:41] — la condition `!etapePrete && !conversationId` ne tient pas compte du paramètre `erreur`. Un élève ayant déjà une Conversation "Sauvegarder" (cookie valide) dont une tentative de création éphémère vient d'échouer serait silencieusement redirigé vers sa Conversation existante au lieu de voir le message d'erreur préexistant de la Story 1.2. **Corrigé** : `!erreurEphemere` ajouté à la condition ; vérifié par `curl` que le message d'erreur s'affiche bien même avec un cookie valide présent.
- [x] [Review/Dismiss] Avertissement "ne partage jamais ce lien" en mode Éphémère signalé comme hors périmètre — contamination du diff par les corrections de revue non commitées de la Story 1.3 (déjà décidées et documentées dans le fichier de cette story), pas du code introduit par la Story 1.4.
- [x] [Review/Dismiss] Le message élève juste envoyé n'apparaît pas dans l'historique sans rechargement — non-objectif explicite documenté dans les Dev Notes de cette story ("pas de mise à jour live... aucune exigence de ce type pour cette story") ; un rechargement (ex. retour par cookie) affiche bien l'historique complet, vérifié.
- [x] [Review/Dismiss] Aucun moyen de démarrer une seconde Conversation "Sauvegarder" tant qu'un cookie existe — comportement voulu par FR-2 ("retrouve automatiquement **sa** Conversation précédente", au singulier), pas une régression.
- [x] [Review/Dismiss] Chemin `sender_type: organisateur` pas encore exercable en pratique — attendu, la réponse organisateur est prévue en Epic 3, explicitement hors périmètre des Dev Notes de cette story.
- [x] [Review/Dismiss] Absence de pagination/limite sur la requête des messages — non-objectif explicite documenté dans les Dev Notes/Task 4 de cette story.
- [x] [Review/Dismiss] Vérification d'autorisation dupliquée entre `page.tsx`, `actions.ts` et `findConversationBySessionToken` — duplication volontaire et déjà documentée dans les Dev Notes de cette story ("ne pas tenter de factoriser... dans cette story").
- [x] [Review/Dismiss] Uuid de Conversation visible dans la barre d'adresse en mode Sauvegarder, jugé en contradiction avec l'avertissement du mode Éphémère — bâti sur une lecture erronée du modèle de sécurité : en mode Sauvegarder, l'uuid n'a jamais été le secret (c'est le cookie, vérifié par AC #5 de cette story) ; l'avertissement ne s'applique qu'au mode Éphémère, qui n'a par construction aucun cookie (déjà documenté, décision de Charles en Story 1.3).
- [x] [Review/Dismiss] Mauvais libellé possible si `sender_type` a une valeur inattendue — inatteignable en pratique : la contrainte `CHECK (sender_type in ('eleve', 'organisateur'))` en base de données garantit qu'aucune autre valeur ne peut exister.

## Dev Notes

- **Point de départ exact** : la Story 1.3 a volontairement laissé hors périmètre l'affichage de l'historique et la détection du retour par cookie ("Portée volontairement limitée" + Dev Notes citant explicitement cette Story 1.4). Cette story construit les deux ensemble, car elles sont liées : le retour par cookie n'a de sens que si l'historique s'affiche une fois la Conversation retrouvée. [Source: 1-3-envoi-du-premier-message-et-accuse-de-reception.md, Dev Notes]
- **Ne pas confondre deux chemins vers `?etape=pret&conv=<id>`** : (a) la redirection existante posée par `choisirModeSauvegarder`/`choisirModeEphemere` juste après création (Story 1.2/1.3, inchangée — l'id est déjà connu à cet instant, pas besoin de recherche de cookie) ; (b) la nouvelle redirection de cette story, déclenchée uniquement sur un atterrissage "à froid" (aucun `etape`/`conv` dans l'URL), qui elle recherche la Conversation par cookie. Les deux aboutissent à la même branche de rendu (Task 3), qui doit fonctionner correctement dans les deux cas.
- **Risque de confidentialité en lecture à corriger, non explicite dans le PRD/epics mais nécessaire pour ne pas régresser l'existant** : la Story 1.3 a protégé l'**écriture** dans `envoyerMessage` contre un `conv` manipulé dans l'URL (AC #4 de 1.3). Tant qu'aucun historique n'était affiché, un `conv` manipulé ne permettait de lire aucun contenu. Cette story ajoute l'affichage de l'historique — sans la même vérification côté lecture, n'importe qui devinant/copiant un uuid de Conversation "Sauvegarder" pourrait lire les messages d'un autre élève en visitant `?etape=pret&conv=<id-devine>`. Reproduire ici, côté page, la même vérification cookie que `envoyerMessage` (`verifySecret` contre `session_token_hash`) avant d'afficher quoi que ce soit (Task 3, AC #5).
- **Le mode Éphémère reste sans équivalent de cette protection**, par construction (aucun cookie n'existe, AD-5) — limite déjà connue et acceptée en Story 1.3 (seul le secret du lien protège ce mode ; Charles a tranché lors de la revue de 1.3 : avertissement textuel seulement, pas de mitigation technique — cf. "Review Findings" de 1.3). Ne pas construire de protection supplémentaire pour l'éphémère ici, c'est hors périmètre et déjà tranché.
- **Pattern de recherche O(n) par bcrypt déjà établi** : `isCodeAvailable` dans `lib/session.ts` (Story 1.2) scanne toutes les Conversations pour comparer un Code candidat à chaque `recovery_code_hash`. `findConversationBySessionToken` est une fonction sœur, même structure, colonne différente (`session_token_hash`), filtrée en plus par `is_ephemeral = false`. Accepté à l'échelle d'un lycée (NFR-1) — ne pas introduire d'index/cache prématuré. [Source: lib/session.ts, ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Différence volontaire avec `isCodeAvailable`** : `findConversationBySessionToken` ne doit **pas** lancer d'exception (contrairement à `isCodeAvailable`) — elle tourne à chaque chargement de la page de chat, potentiellement par un élève revenant, alors que `isCodeAvailable` n'est appelée qu'au moment ponctuel de la création d'un Code. Capturer toute erreur en interne et retourner `null` (cohérent avec NFR-2, accessibilité continue).
- **Lecture directe de Supabase depuis un Server Component (`page.tsx`), sans Server Action** : autorisé par l'Architecture — AD-3 impose une Server Action uniquement pour les **écritures** ("toute écriture... passe par une Server Action"), pas pour les lectures. Le futur FR-5 (Story 3.2, `app/organisateurs/page.tsx`) suivra le même principe de lecture directe en page. Ne pas créer de Server Action juste pour lire les messages ou vérifier le cookie de cette story. [Source: ARCHITECTURE-SPINE.md#AD-3, #AD-4]
- **Aucun document UX** (`*ux*.md`) n'existe dans les artefacts de planification — le style visuel de la distinction élève/organisateur dans le fil de conversation est un choix libre à faire à l'implémentation, cohérent avec les styles Tailwind déjà utilisés (`message-form.tsx`, `mode-choice.tsx`, dark mode systématique).
- **Pas de temps réel/websocket à construire** : l'historique est chargé une fois au rendu serveur de la page ; pas de mise à jour live si un organisateur répond pendant que l'élève a la page ouverte — aucune exigence de ce type dans le PRD/epics pour cette story (et l'interface organisateur/réponse n'existe pas encore, Epic 3).
- **Conventions transverses toujours valables** : ids en `uuid`, dates en `timestamptz`, aucune PII élève stockée, aucun contenu de message ni secret (cookie/Code) dans les logs serveur. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Pas de nouvelle dépendance** : réutilise `@supabase/supabase-js`, `bcryptjs`, `next/headers` (déjà utilisés depuis Story 1.1/1.2). Pas de framework de test à introduire (toujours absent de la Stack) — vérification manuelle uniquement, comme les Stories 1.1 à 1.3.
- **Historique git** : au moment de la création de cette story, les corrections de revue de la Story 1.3 (voir sa section "Review Findings") sont appliquées dans l'arborescence de travail mais **pas encore commitées** sur `main` (dernier commit : `4ba6e2f`, "Story 1.3 (review)"). Cette story part de cet état de travail (fichiers `actions.ts`/`message-form.tsx`/`page.tsx` déjà modifiés par la revue de 1.3), pas d'un commit propre — lire les fichiers directement dans l'arborescence courante, pas une version reconstituée depuis git.

### Project Structure Notes

Fichiers à créer par cette story :
- `app/discussion-anonyme/conversation-thread.tsx` — Server Component d'affichage de l'historique (Task 4)

Fichiers à modifier :
- `lib/session.ts` — ajout de `findConversationBySessionToken` (Task 1)
- `app/discussion-anonyme/page.tsx` — détection du retour par cookie, vérification d'autorisation en lecture, chargement des messages, rendu de `ConversationThread` (Tasks 2, 3)

Fichiers **non créés/non touchés** dans cette story, à ne pas anticiper :
- `app/discussion-anonyme/actions.ts`, `message-form.tsx` — inchangés, `envoyerMessage` déjà correct depuis la Story 1.3
- Écran de saisie de Code pour récupération multi-appareil — Story 1.5
- `lib/danger-keywords.ts`, `lib/telegram.ts`, réponse organisateur — Epic 2/3
- `supabase/migrations/` — aucune nouvelle table/colonne nécessaire, le schéma existant (`conversations.session_token_hash`, `messages.sender_type`) suffit

Aucune variance détectée par rapport à l'arborescence de référence de l'Architecture (`lib/session.ts` et `app/discussion-anonyme/*` sont bien les emplacements prévus pour FR-2).

### References

- [Source: prd.md#FR-2 (§4.1)] — continuité par cookie, conversation vierge si cookie absent, hors périmètre : récupération sans cookie ni Code
- [Source: epics.md#Epic-1, Story-1.4] — story source, AC épics
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions uniquement pour les écritures ; lecture directe en page autorisée
- [Source: ARCHITECTURE-SPINE.md#AD-4] — aucun accès client direct à Supabase ; clé service côté serveur uniquement
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `session_token` cookie httpOnly ~12 mois, mode éphémère sans session persistante
- [Source: ARCHITECTURE-SPINE.md, Modèle de données] — colonnes `conversations.session_token_hash`, `messages.sender_type/body/created_at`
- [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions] — uuid, timestamptz, pas de PII, pas de contenu en logs
- [Source: lib/session.ts] — `isCodeAvailable` (pattern O(n) bcrypt à reproduire), `verifySecret`, `SESSION_COOKIE_NAME`
- [Source: app/discussion-anonyme/actions.ts] — vérification cookie existante dans `envoyerMessage` (AC #4 de la Story 1.3), à reproduire côté lecture
- [Source: 1-3-envoi-du-premier-message-et-accuse-de-reception.md, Dev Notes + Portée volontairement limitée] — historique et retour par cookie explicitement différés à cette story

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur.
- `npm run build` (Next.js/Turbopack, avec le vrai `.env.local`) : compilation et typecheck réussis, route `/discussion-anonyme` toujours dynamique (ƒ).
- Vérification par script Node ad hoc (`@supabase/supabase-js` + `bcryptjs`, contre le vrai projet Supabase du `.env.local`, données auto-nettoyées) rejouant la logique exacte de `findConversationBySessionToken` et de la vérification d'autorisation en lecture de `page.tsx` : (1) un `session_token` valide retrouve bien sa Conversation "Sauvegarder" (AC #1) ; (2) un token inconnu/jamais créé retourne `null` sans exception (AC #3) ; (3) le cookie de la Conversation A ne passe PAS la vérification contre la Conversation B (AC #5) ; (4) le bon cookie passe bien la vérification pour sa propre Conversation ; (5) une Conversation éphémère est bien marquée `is_ephemeral = true` (AC #6) ; (6) l'historique d'une Conversation contient bien ses 2 messages dans l'ordre chronologique avec les bons `sender_type` (AC #4). Les 6 vérifications sont passées (`OK`), données de test supprimées immédiatement après.
- Vérification HTTP de bout en bout contre le serveur `next dev` déjà lancé par Charles sur `http://localhost:3000` (non redémarré, incident de la Story 1.3 évité) : (a) une Conversation "Sauvegarder" réelle créée en base avec un `session_token` connu + 2 messages (élève, organisateur) marqués par un texte témoin ; `curl` avec ce cookie sur `/discussion-anonyme` (atterrissage à froid, aucun paramètre d'URL) → réponse `307` vers `?etape=pret&conv=<id>`, puis en suivant la redirection, les 2 messages témoins et les libellés "Toi"/"L'équipe" apparaissent bien dans le HTML (AC #1, #4) ; (b) le même `conv` interrogé avec un cookie différent → `307` vers `/discussion-anonyme`, aucun contenu témoin dans la réponse (AC #5) ; (c) une Conversation éphémère réelle avec un message témoin, interrogée sans aucun cookie → contenu témoin affiché normalement (AC #6) ; (d) `/discussion-anonyme` sans cookie du tout → texte de divulgation et choix de mode affichés, code `200`, aucune redirection ni erreur (AC #2). Toutes les données de test (2 Conversations, 3 messages) supprimées immédiatement après via script.
- Rendu visuel confirmé par Charles le 2026-07-09 sur `http://localhost:3000/discussion-anonyme` : capture d'écran desktop montrant le retour automatique fonctionnel (message "Toi" affiché depuis l'historique retrouvé, sans repasser par la divulgation/choix de mode), puis confirmation en mode responsive DevTools pour le rendu mobile (l'accès direct depuis un vrai téléphone sur le même Wi-Fi n'a pas abouti — connexion impossible malgré firewall macOS désactivé et serveur à l'écoute sur `*:3000`, probablement une limite de l'environnement réseau de la machine de développement ; contourné par l'émulation responsive du navigateur, suffisante pour valider la lisibilité et la distinction élève/organisateur).
- Point remonté par Charles pendant la vérification visuelle : absence d'un bouton/badge "sauvegarder" sur l'écran de conversation retrouvée. Clarifié et confirmé avec lui que c'est le comportement attendu — la sauvegarde est automatique via le cookie posé au moment du choix initial du mode (Story 1.2), aucune action répétée n'est nécessaire ni prévue par le PRD/epics sur cet écran. Aucun changement de code découlant de cet échange.
- Incident sans rapport avec le code de cette story : en cours de session, tout le dossier de travail `/Users/steve/Desktop/la-parole-contre-tous` (y compris `.git`) s'est brièvement retrouvé dans la Corbeille macOS (cause externe, hors de mes actions), puis restauré par Charles ("Remettre en place" depuis le Finder). Vérifié après restauration : `git log`/`git rev-parse HEAD` intacts (toujours `4ba6e2f`), toutes les modifications non commitées de cette session présentes. Aucune perte de travail.

### Completion Notes List

- Tasks 1 à 4 entièrement implémentées et vérifiées par script + `curl` contre le vrai projet Supabase et le serveur `next dev` réel (voir Debug Log) : `findConversationBySessionToken` (`lib/session.ts`), détection du retour par cookie + vérification d'autorisation en lecture + chargement des messages (`page.tsx`), et affichage de l'historique (`conversation-thread.tsx`).
- Les 6 AC sont couverts et vérifiés : #1, #2, #3, #4, #5, #6 par script/`curl` contre la vraie base Supabase et le serveur réel ; rendu visuel (mobile/desktop) confirmé par Charles.
- Task 5 est désormais entièrement cochée : vérifications automatisées (agent) + confirmation visuelle desktop/mobile (Charles, 2026-07-09, via capture d'écran puis mode responsive DevTools).
- Revue de code effectuée (3 couches : Blind Hunter, Edge Case Hunter, Acceptance Auditor) sur `lib/session.ts` et `app/discussion-anonyme/page.tsx`/`conversation-thread.tsx` : 4 patches identifiés et corrigés (gestion d'erreur des requêtes Supabase directes, robustesse de la boucle bcrypt, tri stable des messages, non-régression du message d'erreur éphémère), 8 signalements écartés (contexte déjà documenté dans cette story ou dans la Story 1.3, ou lecture erronée du modèle de sécurité). Patches re-vérifiés par `lint`/`build` et par requêtes HTTP réelles contre le serveur `next dev`.
- Story passée en `done`.

### File List

- `lib/session.ts` (modifié — ajout de `findConversationBySessionToken` ; patch de revue : gestion d'erreur par ligne dans la boucle bcrypt)
- `app/discussion-anonyme/page.tsx` (modifié — détection du retour par cookie, vérification d'autorisation en lecture, chargement des messages, rendu de `ConversationThread` ; patches de revue : gestion d'erreur sur les requêtes Supabase, tri secondaire des messages, exclusion de `erreur=ephemere` de la détection de retour)
- `app/discussion-anonyme/conversation-thread.tsx` (créé — affichage de l'historique élève/organisateur)

## Change Log

- 2026-07-09 : Implémentation complète de la Story 1.4 — `findConversationBySessionToken` (`lib/session.ts`), détection du retour par cookie + vérification d'autorisation en lecture + chargement de l'historique (`page.tsx`), nouveau composant `ConversationThread`. Vérifié par `lint`/`build`, par script contre le vrai projet Supabase, et par requêtes HTTP réelles contre le serveur `next dev` (redirection par cookie, historique affiché, garde-fou anti-fuite entre Conversations, mode éphémère inchangé). Rendu mobile/desktop confirmé par Charles. Incident sans rapport avec le code : le dossier de travail a brièvement transité par la Corbeille macOS puis a été restauré par Charles, sans perte de travail (vérifié post-restauration). Les 5 tasks et les 6 AC sont satisfaits — passage en `review`.
- 2026-07-09 : Revue de code (3 couches adversariales) — 4 patches appliqués (gestion d'erreur Supabase dans `page.tsx`, robustesse par ligne de la boucle bcrypt dans `findConversationBySessionToken`, tri secondaire des messages par `id`, exclusion de `erreur=ephemere` de la détection de retour par cookie) ; 8 signalements écartés avec justification documentée. Revérifié par `lint`/`build` et requêtes HTTP réelles. Passage en `done`.
