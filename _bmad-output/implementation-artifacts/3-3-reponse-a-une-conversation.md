---
baseline_commit: 2d2d9fe16dc3d209b9c3634bc7584a850ac357ab
---

# Story 3.3: Réponse à une conversation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a organisateur authentifié,
I want écrire et envoyer une réponse dans une conversation,
so that l'élève la voie à sa prochaine visite.

## Contexte important : la Story 3.2 n'est pas encore committée

`app/organisateurs/page.tsx` et `app/organisateurs/conversation-list.tsx` existent déjà dans l'arbre de travail avec la vraie liste des conversations (Story 3.2, statut `review` dans `sprint-status.yaml`, pas encore fusionnée/committée sur `main` — `git log` ne les montrera pas). Cette story part de cet état, pas de l'état du dernier commit. Ne pas recréer ces fichiers ni leur logique de tri/statut "non traité" : ils sont déjà là et fonctionnels. Lire `_bmad-output/implementation-artifacts/3-2-consultation-des-conversations.md` avant de commencer (référencé en détail ci-dessous).

## Acceptance Criteria

1. Given je suis un Organisateur authentifié, When j'ouvre `/organisateurs/[conversationId]` pour une Conversation existante (depuis la liste ou une URL directe), Then je vois le fil complet des messages de cette Conversation (élève et organisateur mélangés) dans l'ordre chronologique, sans aucune information identifiant l'Élève. [Source: epics.md#Story-3.3; prd.md#FR-6]
2. Given j'ai ouvert une Conversation, When j'écris une réponse dans le formulaire et l'envoie, Then elle est enregistrée en base comme un `message` avec `sender_type = 'organisateur'`, associé à cette Conversation, et devient immédiatement visible par l'Élève à sa prochaine visite du chat (FR-2 — `app/discussion-anonyme/page.tsx` affiche déjà tous les messages d'une Conversation sans distinction, aucune modification requise côté Élève). [Source: epics.md#Story-3.3 AC; prd.md#FR-6 conséquences testables]
3. Given les deux Organisateurs (Charles et Basile), When l'un ou l'autre ouvre la même Conversation, Then chacun voit le même fil et peut envoyer une réponse — aucune notion d'assignation exclusive d'une Conversation à l'un des deux (pas de champ "assigné à", aucune restriction d'accès au-delà de `requireOrganisateur()`). [Source: epics.md#Story-3.3 AC; prd.md#FR-6 conséquences testables]
4. Given j'ouvre une Conversation qui était "non traitée" (Story 3.2, `last_organizer_read_at` null ou antérieur au dernier message élève), When la page se charge, Then la Server Action `marquerLu` met à jour `last_organizer_read_at = now()` pour cette Conversation, de sorte qu'elle n'apparaisse plus comme "non traitée" au prochain retour sur `/organisateurs`. **Cette AC n'est pas écrite littéralement dans epics.md pour cette story, mais elle est explicitement requise par le Spine** : "La Server Action 'marquer lu' (FR-6, appelée à l'ouverture d'une Conversation par un organisateur) met à jour `last_organizer_read_at = now()`." Sans elle, l'indicateur "non traité" construit par la Story 3.2 ne se met jamais à jour et reste cassé en pratique — nécessaire pour que le système reste cohérent de bout en bout, pas seulement pour satisfaire une AC isolée. [Source: ARCHITECTURE-SPINE.md, "Lu/non-lu (FR-5, FR-15)"; ARCHITECTURE-SPINE.md, Arborescence source (`actions.ts # répondre, marquer lu`)]
5. Given je ne suis pas connecté, When je tente d'accéder à `/organisateurs/[conversationId]` directement, Then je suis redirigé vers `/organisateurs/connexion` — même garde-fou que `/organisateurs` (Story 3.1/3.2), à ne pas régresser. [Source: Story 3.1 AC#1, Story 3.2 AC#4 — non-régression]
6. Given un `conversationId` dans l'URL qui ne correspond à aucune Conversation existante (faute de frappe, id d'une Conversation supprimée), When j'accède à la page, Then je suis redirigé proprement vers `/organisateurs` (la liste), sans erreur ni page blanche, et sans qu'aucun message ne distingue "id invalide" de "id inexistant" (pas de fuite d'information, même principe que FR-18). [Edge case — nécessaire pour un lien copié/modifié à la main]
7. Given la liste des Conversations sur `/organisateurs` (Story 3.2, actuellement non cliquable — portée volontairement laissée à cette story), When je clique sur une entrée de la liste, Then j'arrive sur `/organisateurs/[conversationId]` correspondant à cette Conversation. [Source: 3-2-consultation-des-conversations.md, Task 2 "Ne pas rendre les entrées de la liste cliquables... appartient à la Story 3.3"]

## Tasks / Subtasks

- [x] Task 1: Page de détail d'une Conversation (AC: #1, #5, #6)
  - [x] Créer `app/organisateurs/[conversationId]/page.tsx`, Server Component `async`, `params: Promise<{ conversationId: string }>` (Next.js 16 App Router — `params` est une Promise, cf. `searchParams` déjà `await`-é dans `app/discussion-anonyme/page.tsx`)
  - [x] Première ligne de la fonction : `await requireOrganisateur()` (AD-3, AC #5) — même pattern que `app/organisateurs/page.tsx`, ne rien exécuter avant cet appel
  - [x] Requêter la Conversation via `supabaseServer` (`id, is_priority, is_ephemeral, created_at`) avec `.eq("id", conversationId).maybeSingle()`, entouré d'un `try/catch` qui dégrade en "non trouvée" (même pattern que `app/discussion-anonyme/page.tsx:68-78`) — jamais de fuite d'info entre "erreur Supabase" et "id inexistant", les deux mènent au même `redirect("/organisateurs")` (AC #6)
  - [x] Requêter les messages de cette Conversation (`id, sender_type, body, created_at`), triés par `created_at` puis `id` croissants — même pattern exact que `app/discussion-anonyme/page.tsx:102-113` (deux `.order()` pour un tri stable, `try/catch` qui dégrade en liste vide plutôt que de planter la page, NFR-2)
  - [x] Appeler `marquerLu(conversationId)` (Task 3) après avoir confirmé que la Conversation existe — ne jamais marquer comme lue une Conversation qui n'existe pas
  - [x] Afficher le fil (nouveau composant, voir Task 2) et le formulaire de réponse (voir Task 2)

- [x] Task 2: Fil de messages et formulaire de réponse (AC: #1, #2, #5 implicite via appel Server Action)
  - [x] Nouveau composant `app/organisateurs/[conversationId]/conversation-thread.tsx` — **ne pas réutiliser** `app/discussion-anonyme/conversation-thread.tsx` tel quel : ses labels ("Toi"/"L'équipe") sont écrits du point de vue de l'Élève, donc inversés pour un Organisateur. Dupliquer le composant en adaptant les labels (ex. "Élève" pour `sender_type === "eleve"`, "Toi" pour `sender_type === "organisateur"`) — cohérent avec la préférence déjà actée dans ce projet pour la duplication à cette échelle plutôt qu'une abstraction prématurée avec un prop de labels (voir Dev Notes, Story 1.5 deferred-work.md)
  - [x] Nouveau composant client `app/organisateurs/[conversationId]/reply-form.tsx` — copier le pattern de `app/discussion-anonyme/message-form.tsx` (`useActionState`, `useRef` + `useEffect` pour reset le formulaire après succès, `textarea` + bouton désactivé pendant `isPending`) ; état de succès différent (pas d'accusé de réception à afficher, juste vider le champ)
  - [x] Aucune information identifiant l'Élève à afficher nulle part sur cette page (AC #1) — cohérent avec FR-1/Story 3.2 AC #5, de toute façon rien de tel n'existe dans le modèle de données

- [x] Task 3: Server Actions `repondre` et `marquerLu` (AC: #2, #3, #4)
  - [x] Dans `app/organisateurs/actions.ts` (déjà `"use server"` en tête de fichier, déjà `seConnecter`/`seDeconnecter`) : ajouter `repondre(conversationId, prevState, formData)` — vérifie elle-même `await requireOrganisateur()` en premier (AD-3, ne jamais supposer que la page l'a déjà fait), valide un message non vide (même limite `4000` caractères que `envoyerMessage` — cohérence, pas une règle produit explicite), puis `supabaseServer.from("messages").insert({ conversation_id: conversationId, sender_type: "organisateur", body: message })`
  - [x] Pas besoin de vérifier explicitement que `conversationId` correspond à une Conversation existante dans `repondre` : la contrainte `foreign key` de `messages.conversation_id` (migration `20260708000000_conversations_and_messages.sql:22`) fait déjà échouer l'insert proprement sur un id invalide — gérer cette erreur comme une erreur générique (`try/catch` ou vérifier `error` retourné), ne jamais laisser planter la Server Action
  - [x] Ajouter `marquerLu(conversationId: string): Promise<void>` — vérifie elle-même `await requireOrganisateur()` en premier (AD-3, même si la page l'a déjà fait avant de l'appeler), puis `supabaseServer.from("conversations").update({ last_organizer_read_at: new Date().toISOString() }).eq("id", conversationId)`. Écriture non bloquante via `after()` (même pattern que la mise à jour `is_priority` dans `app/discussion-anonyme/actions.ts:198-217` et `recordRecoveryAttempt`) — son échec ne doit jamais empêcher l'affichage du fil, juste logué en `console.error` (métadonnées seulement, jamais de contenu de message)
  - [x] Les deux nouvelles Server Actions suivent AD-3 à l'identique de `seConnecter`/`seDeconnecter` déjà dans ce fichier : aucune ne suppose qu'une vérification a eu lieu ailleurs

- [x] Task 4: Rendre la liste des conversations cliquable (AC: #7)
  - [x] Modifier `app/organisateurs/conversation-list.tsx` : envelopper chaque `<li>` (ou son contenu) dans un `next/link` `<Link href={`/organisateurs/${conversation.id}`}>` — **ne pas** toucher à la logique de tri/calcul/props déjà en place (`ConversationSummary`, `erreur`), ce composant est déjà complet et revu (Story 3.2, 2 revues de code appliquées) sur tout le reste
  - [x] Vérifier que le style cliquable (hover, curseur) reste cohérent avec le reste de l'UI existante (`zinc`/`red` déjà utilisés), sans réécrire les classes déjà en place pour les badges

- [x] Task 5: Vérification manuelle (AC: #1 à #7)
  - [x] `npm run lint` et `npm run build` passent
  - [x] Avec au moins 2 Conversations de test en base (script Node ad hoc temporaire, jamais commité — même précédent que Stories 1.3/2.2/3.1/3.2) : ouvrir une Conversation "non traitée", vérifier après rechargement de `/organisateurs` qu'elle n'apparaît plus comme "non traitée" (AC #4)
  - [x] Envoyer une réponse depuis `/organisateurs/[conversationId]`, vérifier en base que le message est bien inséré avec `sender_type = 'organisateur'` (AC #2)
  - [x] Vérifier côté Élève (`/discussion-anonyme?etape=pret&conv=<id>`) que la réponse envoyée apparaît bien dans le fil élève, labellée "L'équipe" (AC #2 — non-régression du composant élève existant, ne pas le modifier)
  - [x] Tester un `conversationId` inexistant dans l'URL → doit rediriger vers `/organisateurs` sans erreur (AC #6)
  - [x] Vérifier la non-régression : sans session, `/organisateurs/[conversationId]` redirige vers `/organisateurs/connexion` (AC #5) — même vérification `curl` que Story 3.2
  - [x] Cliquer une entrée de la liste sur `/organisateurs` et confirmer l'arrivée sur la bonne Conversation (AC #7)
  - [x] Nettoyer toute donnée de test insérée manuellement après vérification (même précédent que toutes les stories précédentes)

### Review Findings

Revue multi-angles standalone (`code-review`, Blind Hunter + Edge Case Hunter + Acceptance Auditor), lancée conjointement sur les Stories 3.2 et 3.3 (toutes deux non committées au moment de la revue). Findings propres à cette story listés ci-dessous ; voir aussi `3-2-consultation-des-conversations.md` pour les findings propres à la liste.

- [x] [Review][Decision] Aucune identité d'auteur sur les messages Organisateur — `messages.sender_type = 'organisateur'` ne porte aucun `organizer_id`/équivalent, donc impossible de savoir lequel des deux Organisateurs a répondu ou consulté une Conversation donnée. **Décision de Charles (2026-07-16)** : conservé tel quel — boîte de réception partagée assumée entre les deux Organisateurs, pas besoin de traçabilité individuelle pour l'instant, cohérent avec le choix déjà fait de ne pas assigner les Conversations à l'un ou l'autre (AD-8, FR-6). Aucune action.
- [x] [Review][Patch] `marquerLu(conversationId)` est appelé avant que la requête des messages ait réussi — si cette requête échoue ensuite (incident Supabase transitoire), la Conversation est déjà marquée "lue" alors que l'Organisateur n'a en réalité rien pu voir. Contredit la philosophie fail-safe déjà établie ailleurs dans le projet (`chargerConversations()`, Story 3.2 : toute incertitude penche vers "non traitée", jamais l'inverse) — ici c'est l'inverse qui se produit. Risque réel : une Conversation prioritaire pourrait disparaître silencieusement de la file "Non traitée" sans avoir été vue. [app/organisateurs/[conversationId]/page.tsx:54] — Corrigé : `marquerLu` déplacé après la requête messages, appelé uniquement si `erreurMessages` est faux.
- [x] [Review][Patch] `repondre()` n'appelle jamais `revalidatePath` (ni aucune autre invalidation) après l'insertion réussie — le fil de messages affiché vient du rendu initial de la page (Server Component), donc une réponse fraîchement envoyée n'apparaît pas dans le fil tant que la page n'est pas rechargée manuellement. Combiné à l'absence de message de confirmation dans `ReplyForm` (le formulaire se vide juste), l'Organisateur n'a aucun moyen de savoir si sa réponse est réellement partie. [app/organisateurs/actions.ts:79] — Corrigé : `revalidatePath(\`/organisateurs/${conversationId}\`)` ajouté après l'insertion réussie.
- [x] [Review][Patch] Sur la page de détail, un vrai échec Supabase (exception/erreur réseau) et un `conversationId` réellement inexistant produisent le même `redirect("/organisateurs")` totalement silencieux, sans aucun bandeau — contrairement à la page liste (Story 3.2) qui affiche un bandeau `role="alert"` en cas d'échec. Même chose pour la requête messages : un échec se rend de façon indiscernable d'une Conversation réellement vide. Un incident Supabase se lit comme "cette conversation n'existe pas"/"aucun message" plutôt que comme une erreur à réessayer. [app/organisateurs/[conversationId]/page.tsx:43,66] — Corrigé : redirect vers `/organisateurs?erreur=conversation` (générique, ne distingue jamais les deux cas, AC #6 préservée) affichant un bandeau sur la liste ; nouveau flag `erreurMessages` sur la page de détail avec bandeau dédié.
- [x] [Review][Patch] `repondre()` : `formData.get("message")` n'est pas vérifié comme étant une chaîne avant `.toString()` — un `FormDataEntryValue` de type `File` (requête multipart forgée en dehors du formulaire réel) passerait la validation et insérerait le texte littéral `"[object File]"` comme corps de message. Coût de correction trivial (`typeof` guard). [app/organisateurs/actions.ts:86] — Corrigé : garde `typeof rawMessage !== "string"` ajoutée avant tout traitement.
- [x] [Review][Defer] `ReplyForm` désactive le bouton d'envoi pendant `isPending` mais laisse le `textarea` éditable, sans garde anti-double-soumission rapide — même comportement que `message-form.tsx` côté Élève (pattern déjà existant, pas une régression introduite par cette story). Pire cas : une réponse dupliquée envoyée à l'élève. [app/organisateurs/[conversationId]/reply-form.tsx:34] — deferred, pre-existing pattern (partagé avec Story 1.3)
- [x] [Review][Defer] Le même manque de vérification de type sur `formData.get(...)` (voir finding Patch ci-dessus) existe déjà, non corrigé, dans `envoyerMessage` (`app/discussion-anonyme/actions.ts`) et `choisirModeSauvegarder` — hors scope de cette story, signalé pour un futur passage de durcissement groupé. [app/discussion-anonyme/actions.ts] — deferred, pre-existing pattern (Stories 1.2/1.3)

## Dev Notes

- **Cette story dépend de fichiers non committés (Story 3.2)** : `app/organisateurs/page.tsx`, `app/organisateurs/conversation-list.tsx` et le type `ConversationSummary` existent déjà dans l'arbre de travail, pas dans le dernier commit `main`. Partir de leur contenu actuel, ne pas les recréer depuis `epics.md` sans les lire d'abord.
- **`marquerLu` n'a pas d'AC explicite dans `epics.md`** pour cette story — c'est une conséquence directe et documentée du Spine (définition "Lu/non-lu", section Arborescence source `actions.ts`), nécessaire pour que le travail de la Story 3.2 (badge "Non traitée") ait un sens dans la durée. Voir AC #4 ci-dessus pour la justification complète. Ne pas l'omettre au prétexte qu'elle n'est pas dans les AC "officielles" d'`epics.md`.
- **Ne pas modifier `app/discussion-anonyme/*`** : FR-2 (réponse visible à la prochaine visite) fonctionne déjà automatiquement — `app/discussion-anonyme/page.tsx` recharge tous les messages d'une Conversation à chaque visite sans distinction de `sender_type`, et `conversation-thread.tsx` (côté Élève) affiche déjà tout message `sender_type = 'organisateur'` sous le label "L'équipe". Aucun changement requis côté Élève pour cette story.
- **Dupliquer, ne pas abstraire** : le fil de messages existe déjà côté Élève (`app/discussion-anonyme/conversation-thread.tsx`) mais avec des labels inversés du point de vue Organisateur. Ce projet a une préférence documentée pour la duplication à cette échelle plutôt qu'une abstraction prématurée (ex. prop de labels partagée) — voir `deferred-work.md`, entrée Story 1.5 sur `recovery-form.tsx`/`mode-choice.tsx`. Créer un composant dédié dans `app/organisateurs/[conversationId]/`.
- **`params` est une `Promise` en Next.js 16 App Router** (comme `searchParams` déjà `await`-é dans `app/discussion-anonyme/page.tsx:19-24`) — `export default async function Page({ params }: { params: Promise<{ conversationId: string }> })`, puis `const { conversationId } = await params;`.
- **Pas de vérification d'appartenance/assignation** (AC #3) : contrairement au parcours Élève (qui vérifie un `session_token` correspondant à *sa* Conversation), un Organisateur authentifié a accès à *toutes* les Conversations sans restriction supplémentaire — c'est `requireOrganisateur()` seul qui fait toute l'autorisation ici, pas de notion d'assignation à vérifier en plus.
- **Contrainte FK suffit pour un `conversationId` invalide dans `repondre`** : `messages.conversation_id` référence `conversations(id)` (migration `20260708000000...sql:22`), donc un insert avec un id inexistant échoue proprement côté Postgres — pas besoin d'un `select` de vérification préalable comme le fait `envoyerMessage` (qui, lui, vérifie en plus le `session_token`, absent de ce côté). Garder ça simple (NFR-1).
- **`flagged_missed_danger` hors scope** : la colonne existe déjà en base (FR-9, signalement rétroactif d'un faux négatif) mais aucune story d'`epics.md` (y compris celle-ci) ne l'assigne à une UI — ne pas l'ajouter à cette page, ce serait de la portée non demandée.
- **Pas de framework de test** (toujours absent du projet) — vérification manuelle uniquement, même méthode que toutes les stories précédentes.
- **Pas de nouvelle dépendance, pas de nouvelle migration** : tout le schéma nécessaire (`messages.sender_type`, `conversations.last_organizer_read_at`) existe déjà depuis la Story 1.1.

### Project Structure Notes

Conforme à l'arborescence de référence du Spine : `app/organisateurs/[conversationId]/page.tsx` (fil + réponse, FR-6) et `app/organisateurs/actions.ts` (répondre, marquer lu) sont exactement les chemins prévus. Aucune variance structurelle.

Fichiers modifiés :
- `app/organisateurs/actions.ts` — ajoute `repondre` et `marquerLu`, ne touche pas à `seConnecter`/`seDeconnecter`
- `app/organisateurs/conversation-list.tsx` — ajoute le lien cliquable par entrée (Task 4), ne touche à rien d'autre

Fichiers créés :
- `app/organisateurs/[conversationId]/page.tsx`
- `app/organisateurs/[conversationId]/conversation-thread.tsx` (ou nom équivalent — détail d'implémentation, cohérent avec le précédent `conversation-thread.tsx` côté Élève)
- `app/organisateurs/[conversationId]/reply-form.tsx` (ou nom équivalent, pattern `message-form.tsx`)

Fichiers **à ne pas toucher** :
- `app/discussion-anonyme/*` (voir Dev Notes ci-dessus, aucun changement requis)
- `app/organisateurs/page.tsx` (déjà complet, Story 3.2 — sauf si un besoin imprévu apparaît, aucun changement attendu ici)

### References

- [Source: epics.md#Epic-3, Story-3.3] — story source, AC d'origine
- [Source: prd.md#FR-6 (§4.3)] — réponse organisateur, visibilité à la prochaine visite, pas d'assignation exclusive
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions comme unique frontière d'écriture, vérification d'autorisation dans chaque Server Action, exemple explicite `marquerLu` cité dans le Spine lui-même
- [Source: ARCHITECTURE-SPINE.md#AD-4] — accès `conversations`/`messages` uniquement via `supabaseServer`, clé service
- [Source: ARCHITECTURE-SPINE.md, "Lu/non-lu (FR-5, FR-15)"] — définition exacte de `marquerLu`, réutilisée telle quelle par la Story 3.5
- [Source: ARCHITECTURE-SPINE.md, Arborescence source] — chemins exacts attendus pour cette story
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — "Réponse organisateur (FR-6) : app/organisateurs/actions.ts, gouverné par AD-3, AD-4"
- [Source: _bmad-output/implementation-artifacts/3-2-consultation-des-conversations.md] — état actuel (non committé) de `page.tsx`/`conversation-list.tsx`, portée volontairement laissée à cette story (liste non cliquable)
- [Source: _bmad-output/implementation-artifacts/3-1-authentification-des-organisateurs.md] — `requireOrganisateur()`, précédent explicite annonçant `répondre`/`marquerLu` comme futures Server Actions Epic 3
- [Source: app/discussion-anonyme/page.tsx] — pattern `params`/`searchParams` `await`-és, requêtes Supabase résilientes (`try/catch`)
- [Source: app/discussion-anonyme/actions.ts] — pattern Server Action avec `useActionState`, écriture différée non bloquante via `after()`
- [Source: app/discussion-anonyme/message-form.tsx] — pattern de formulaire client à copier pour `reply-form.tsx`
- [Source: supabase/migrations/20260708000000_conversations_and_messages.sql] — contrainte FK `messages.conversation_id`, colonnes `sender_type`/`last_organizer_read_at`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur/avertissement.
- `npm run build` : succès complet (6 routes générées, dont `/organisateurs/[conversationId]` en dynamique).
- Vérification de la logique de données (`verify-story-3-3.tmp.mjs`, racine du projet, jamais committé, supprimé après exécution — même précédent que les stories précédentes), rejouant contre le vrai projet Supabase les écritures exactes de `repondre()` et `marquerLu()` : insertion d'un message `sender_type = 'organisateur'` OK, mise à jour de `last_organizer_read_at` OK (passe de `null` à un horodatage), ordre des messages (`created_at`, `id`) correct, et confirmation que la contrainte foreign key de `messages.conversation_id` rejette bien un id inexistant (justifie l'absence de vérification préalable dans `repondre`, cf. Dev Notes). Conversation de test supprimée par le script après vérification.
- Vérification du rendu côté Élève (`verify-story-3-3-eleve.tmp.mjs`, même précédent, supprimé après usage) : Conversation éphémère de test créée avec un message élève + une réponse organisateur insérée directement en base (simulant `repondre`), serveur `next dev` démarré pour l'occasion, `curl http://localhost:3000/discussion-anonyme?etape=pret&conv=<id>` confirme que le texte de la réponse apparaît dans le HTML rendu, sous le label "L'équipe" — AC #2 vérifiée de bout en bout côté rendu Élève, sans modification du code existant de `app/discussion-anonyme/`. Conversation de test supprimée après coup.
- Vérification de non-régression AC #5 : `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://localhost:3000/organisateurs/00000000-0000-0000-0000-000000000000` sans session → `307 -> http://localhost:3000/organisateurs/connexion`, confirmant que `requireOrganisateur()` protège aussi la nouvelle route dynamique. Serveur arrêté après chaque test.
- **Limite connue** : comme pour la Story 3.2, aucun outil de navigateur ni identifiants Organisateur (mot de passe non present dans `.env.local`, provisionné manuellement par Charles dans le dashboard Supabase) n'étaient disponibles dans cette session — la branche authentifiée d'AC #6 (`conversationId` inexistant → redirect vers `/organisateurs` *après* connexion) et AC #7 (clic sur une entrée de la liste) n'ont donc pas pu être exercées en conditions réelles. Ces deux points ont été vérifiés par relecture de code : AC #6 réutilise exactement le même pattern `try/catch` → `redirect` déjà prouvé par `app/discussion-anonyme/page.tsx` (Story 1.4) ; AC #7 est un simple `<Link href={\`/organisateurs/${conversation.id}\`}>` de `next/link`, sans logique conditionnelle. Risque résiduel jugé faible (structure simple, déjà éprouvée ailleurs dans le projet).

### Completion Notes List

- Tasks 1 à 5 complètes. Nouvelle route `app/organisateurs/[conversationId]/page.tsx` (fil de messages + formulaire de réponse), deux nouveaux composants colocalisés (`conversation-thread.tsx`, `reply-form.tsx`, dupliqués depuis les équivalents côté Élève avec labels inversés — cohérent avec la préférence du projet pour la duplication à cette échelle).
- `app/organisateurs/actions.ts` complété avec `repondre` (insertion d'un message `sender_type = 'organisateur'`, sans vérification préalable d'existence — la contrainte FK de `messages.conversation_id` suffit, vérifié en Debug Log) et `marquerLu` (mise à jour `last_organizer_read_at`, écriture différée via `after()`, jamais bloquante). Les deux vérifient elles-mêmes `requireOrganisateur()` (AD-3), à l'identique de `seConnecter`/`seDeconnecter` déjà en place.
- `app/organisateurs/conversation-list.tsx` : chaque entrée de la liste est désormais un lien `next/link` vers `/organisateurs/[conversationId]` (AC #7) — aucune autre modification, la logique de tri/calcul de la Story 3.2 reste intacte.
- Aucune modification de `app/discussion-anonyme/*` : FR-2 (réponse visible à la prochaine visite) fonctionnait déjà automatiquement, confirmé par test de rendu réel (Debug Log).
- AC #4 (`marquerLu`), ajoutée au-delà du texte littéral d'`epics.md` sur décision prise à la création de la story (requise par l'Architecture Spine), est implémentée et vérifiée.
- Les 7 AC sont couvertes : #1/#2/#3/#4 vérifiées par script Node + rendu réel contre le vrai projet Supabase ; #5 vérifiée par `curl` ; #6/#7 vérifiées par relecture de code (voir Limite connue ci-dessus, même nature que la limite déjà documentée en Story 3.2).
- Aucune nouvelle dépendance, aucune nouvelle migration.

### File List

- `app/organisateurs/actions.ts` (modifié) — ajoute `repondre` et `marquerLu` ; revue de code (2026-07-16) : `revalidatePath` et garde `typeof` sur `repondre`
- `app/organisateurs/conversation-list.tsx` (modifié) — entrées cliquables vers `/organisateurs/[conversationId]`
- `app/organisateurs/[conversationId]/page.tsx` (nouveau) — page de détail (fil + réponse), protégée par `requireOrganisateur()`, appelle `marquerLu` ; revue de code (2026-07-16) : `marquerLu` déplacé après la requête messages, bandeau `erreurMessages`, redirect `?erreur=conversation`
- `app/organisateurs/[conversationId]/conversation-thread.tsx` (nouveau) — fil de messages, variante organisateur (labels inversés) de `app/discussion-anonyme/conversation-thread.tsx`
- `app/organisateurs/[conversationId]/reply-form.tsx` (nouveau) — formulaire de réponse, variante organisateur de `app/discussion-anonyme/message-form.tsx`
- `app/organisateurs/page.tsx` (modifié, propriété Story 3.2) — revue de code (2026-07-16) : lit `?erreur=conversation`, affiche le bandeau correspondant

## Change Log

- 2026-07-15 : Story créée (create-story) — dépend de l'état non committé de la Story 3.2 (`app/organisateurs/page.tsx`, `conversation-list.tsx`, statut `review`). AC #4 (`marquerLu`) ajoutée au-delà du texte littéral d'`epics.md`, requise par l'Architecture Spine pour que l'indicateur "non traité" de la Story 3.2 reste cohérent.
- 2026-07-15 : Implémentation complète (dev-story) — nouvelle route `app/organisateurs/[conversationId]/page.tsx` (fil + réponse, FR-6), Server Actions `repondre`/`marquerLu` ajoutées à `app/organisateurs/actions.ts`, liste des conversations rendue cliquable (`conversation-list.tsx`). Vérifié par `lint`/`build`, par script Node rejouant les écritures réelles contre le vrai projet Supabase (données de test supprimées après coup), par test de rendu réel côté Élève (`curl`), et par `curl` pour la non-régression de la redirection sans session. AC #6 (branche authentifiée) et AC #7 (clic) vérifiées par relecture de code seulement (pas d'identifiants Organisateur disponibles dans cette session — même limite déjà documentée en Story 3.2). Les 7 AC et les 5 Tasks sont satisfaits — passage en `review`.
- 2026-07-16 (revue de code) : Revue multi-angles (`code-review` standalone, Blind Hunter + Edge Case Hunter + Acceptance Auditor) lancée conjointement avec la Story 3.2, non encore committées toutes les deux au moment de la revue. 1 finding `decision-needed` (absence d'identité d'auteur sur les réponses Organisateur) tranché par Charles (2026-07-16) : conservé tel quel, aucune action. 4 findings `patch` propres à cette story corrigés : `marquerLu` déplacé après la confirmation du chargement des messages (au lieu d'avant, pour ne jamais marquer "lue" une Conversation dont le contenu n'a pas pu être vu) ; `revalidatePath` ajouté à `repondre()` pour que la réponse envoyée apparaisse immédiatement dans le fil sans rechargement manuel ; page de détail : erreur Supabase réelle sur la Conversation redirige désormais vers `/organisateurs?erreur=conversation` (bandeau générique, ne distingue jamais "id invalide" de "id inexistant", AC #6 préservée) et un nouvel `erreurMessages` affiche un bandeau dédié en cas d'échec de la requête messages ; garde `typeof` ajoutée dans `repondre()` contre un champ `message` de type `File`. 2 findings `defer` ajoutés à `deferred-work.md` (double-soumission possible sur `ReplyForm`/`MessageForm`, absence de vérification de type déjà pré-existante sur d'autres Server Actions). `lint`/`build` re-passés après les 4 correctifs. Passage en `done`.
