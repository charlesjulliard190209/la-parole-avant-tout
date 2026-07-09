---
baseline_commit: 2f897adddfa57623abd38ab546d275b49fc3ac20
---

# Story 1.2: Choix du mode de conversation (sauvegarder ou éphémère)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève qui vient de voir la divulgation,
I want choisir simplement entre "sauvegarder ma conversation" (avec un Code) et "chat éphémère",
so that je décide moi-même si je veux pouvoir revenir plus tard.

## Acceptance Criteria

1. Given la divulgation de confidentialité (Story 1.1) a été affichée et je n'ai ni cookie de session ni Code valide, When j'arrive à cette étape, Then deux options simples et sans jargon me sont présentées : "Sauvegarder ma conversation" et "Chat éphémère". [Source: prd.md#FR-16]
2. Given je choisis "Sauvegarder ma conversation", When je crée mon propre Code (alphanumérique, 6 à 20 caractères), Then si ce Code est déjà pris un message clair me demande d'en choisir un autre, et si le Code est disponible je suis averti que ce Code est un secret à ne jamais partager avant que ma Conversation ne soit créée. [Source: prd.md#FR-17]
3. Given je choisis "Chat éphémère", When je confirme ce choix, Then aucun cookie de session ni aucun Code n'est créé, et je suis prévenu explicitement que je ne pourrai pas revenir lire une réponse plus tard. [Source: prd.md#FR-19]
4. Given j'ai terminé ce choix (mode + Code si "Sauvegarder"), When ma Conversation est créée, Then j'arrive à un état "prêt à écrire" qui succède à cet écran — le champ de saisie du premier message lui-même (Story 1.3) ne doit pas être actif ni visible tant que ce choix n'est pas terminé. [Source: prd.md#FR-16, epics.md#Story-1.2]

## Tasks / Subtasks

- [x] Task 1: Ajouter la dépendance de hachage (AC: #2, #3)
  - [x] Installer `bcryptjs` (dernière stable, voir Dev Notes — version vérifiée par recherche web à cette date) dans `dependencies` (pas `devDependencies`, utilisé en production)
  - [x] Vérifier qu'aucun typage supplémentaire n'est nécessaire (bcryptjs embarque ses propres types depuis la v3)

- [x] Task 2: Créer `lib/session.ts` — mécanisme de session partagé (AC: #2, #3, #4)
  - [x] Fonction de génération d'un `session_token` aléatoire (ex. `crypto.randomBytes(32).toString('hex')` depuis le module Node `crypto`, jamais `Math.random`)
  - [x] Fonction `hashSecret(valeur: string): Promise<string>` — hache un Code ou un session_token avec `bcryptjs` (`bcrypt.hash`)
  - [x] Fonction `verifySecret(valeur: string, hash: string): Promise<boolean>` — compare avec `bcrypt.compare`
  - [x] Fonction `isCodeAvailable(code: string): Promise<boolean>` — **voir Dev Notes, section "Unicité du Code recherché sur des hachages"** : implémente la boucle de comparaison décrite (récupère tous les `recovery_code_hash` non nuls, `bcrypt.compare` le candidat contre chacun, retourne `false` au premier match)
  - [x] Fonction pour poser le cookie `session_token` (httpOnly, ~12 mois, `secure` en production) — utiliser `await cookies()` (API asynchrone depuis Next.js 15+, toujours vraie en 16.2.10)
  - [x] Ne pas construire ici la lecture du cookie au retour (Story 1.4) ni la vérification de Code pour récupération (Story 1.5) — seulement la création

- [x] Task 3: Créer `app/discussion-anonyme/actions.ts` — premières Server Actions du projet (AC: #2, #3, #4)
  - [x] Server Action `choisirModeSauvegarder(prevState, formData)` : lit le Code saisi, valide la longueur (6 à 20 caractères) et le format (alphanumérique uniquement) côté serveur (ne jamais faire confiance à une validation côté client uniquement), vérifie la disponibilité (`isCodeAvailable`), si pris retourne un état d'erreur exploitable par `useActionState`, sinon : génère un `session_token`, hache le Code et le `session_token`, crée la ligne `Conversation` (`is_ephemeral = false`, `recovery_code_hash`, `session_token_hash`), pose le cookie, puis redirige (`redirect()`) vers l'état "prêt à écrire"
  - [x] Server Action `choisirModeEphemere()` : crée directement la ligne `Conversation` (`is_ephemeral = true`, `session_token_hash = null`, `recovery_code_hash = null`), ne pose aucun cookie, puis redirige vers le même état "prêt à écrire"
  - [x] Chaque Server Action vérifie/produit elle-même toutes les données nécessaires — ne suppose jamais qu'une validation a déjà eu lieu côté page (AD-3)
  - [x] Utiliser le client `lib/supabase-server.ts` existant (clé service) pour l'insertion — jamais d'accès Supabase depuis un composant client (AD-4)

- [x] Task 4: Écran de choix de mode (AC: #1, #2, #3)
  - [x] Modifier `app/discussion-anonyme/page.tsx` pour afficher, après le texte de divulgation (Story 1.1, inchangé), les deux options FR-16, sans jargon ("Sauvegarder ma conversation" / "Chat éphémère")
  - [x] Créer un petit Client Component (ex. `app/discussion-anonyme/mode-choice.tsx`, `"use client"`) pour le formulaire "Sauvegarder" : utilise `useActionState` (React 19, voir Dev Notes) pour afficher l'erreur "Code déjà pris" sans recharger toute la page, et l'avertissement "ce Code est un secret, ne le partage avec personne" visible avant validation
  - [x] Le bouton "Chat éphémère" peut rester un formulaire simple (`<form action={choisirModeEphemere}>`) sans état client, avec le message d'avertissement ("tu ne pourras pas revenir lire une réponse") affiché avant le clic, pas seulement après
  - [x] Cet écran ne doit pas encore contenir de champ de saisie de message (Story 1.3) — terminer sur un état placeholder équivalent à celui de la Story 1.1 ("la suite arrive juste après"), maintenant après le choix de mode plutôt qu'avant

- [x] Task 5: Vérification manuelle (AC: #1, #2, #3, #4)
  - [x] Tester le parcours "Sauvegarder" : Code valide accepté, Code déjà pris refusé avec message clair, Code trop court/trop long/avec caractères invalides refusé
  - [x] Tester le parcours "Éphémère" : aucune ligne cookie posée (vérifié dans les DevTools du navigateur), avertissement bien visible avant confirmation
  - [x] Vérifier en base Supabase (Table Editor) qu'une Conversation "Sauvegarder" a bien `recovery_code_hash` et `session_token_hash` renseignés (jamais le Code en clair), et qu'une Conversation "Éphémère" a les deux à `null`
  - [x] Vérifier sur mobile et desktop que les deux options restent lisibles et utilisables

### Review Findings

**Note de contexte** : cette revue a été relancée après une première passe rendue caduque par le démarrage concurrent de la Story 1.3 dans les mêmes fichiers. Le diff analysé exclut délibérément `envoyerMessage` (actions.ts), `message-form.tsx` et `lib/accuse-reception.ts`, qui appartiennent à la Story 1.3 et seront revus quand elle passera en `review`.

- [x] [Review][Decision] L'état "prêt à écrire" affiche déjà le vrai `MessageForm` (Story 1.3) au lieu du placeholder texte exigé par l'AC #4 — **Décision de Charles (2026-07-08) : accepter l'avance de la Story 1.3**, AC #4 considérée satisfaite de fait ; Debug Log corrigé en conséquence (voir Task 5) ; la revue de fond de `MessageForm`/`envoyerMessage` aura lieu quand la Story 1.3 passera en `review`. [app/discussion-anonyme/page.tsx:47-50]
- [x] [Review][Decision] Race condition TOCTOU sur l'unicité du Code — **Décision de Charles (2026-07-08) : accepter le risque, documenter seulement**, sans mécanisme de verrou/transaction pour l'instant (voir `deferred-work.md`). [app/discussion-anonyme/actions.ts:34-51, lib/session.ts:35-54]
- [x] [Review][Decision] Oracle d'énumération via le message "Ce Code est déjà pris" — **Décision de Charles (2026-07-08) : accepter le compromis tel quel**, conforme à l'AC #2 telle qu'écrite, aucune action. [app/discussion-anonyme/actions.ts:46-51]
- [x] [Review][Patch] `isCodeAvailable()` peut lever une exception non interceptée dans `choisirModeSauvegarder`, qui plante sur la page d'erreur générique Next.js au lieu du message français existant [app/discussion-anonyme/actions.ts:46]
- [x] [Review][Patch] `choisirModeEphemere` propage `error?.message` brut de Supabase dans une exception non interceptée (plantage + fuite potentielle de détails internes) au lieu d'un message français cohérent avec l'autre parcours [app/discussion-anonyme/actions.ts:93-97]
- [x] [Review][Patch] `isCodeAvailable` itère `data` sans filet si Supabase renvoie `data: null` (autorisé par le typage du client) — `TypeError` au lieu de traiter l'absence de résultat comme "aucun Code existant" [lib/session.ts:47]
- [x] [Review][Patch] `SESSION_COOKIE_NAME` n'est pas exporté depuis `lib/session.ts` et est dupliqué en chaîne magique `"session_token"` dans `actions.ts` — désynchronisation silencieuse possible en cas de renommage [lib/session.ts:6]
- [x] [Review][Patch] Comparaison du Code sensible à la casse (bcrypt exact-match, aucune normalisation) — risque de blocage si l'élève retape son Code avec une casse différente plus tard [lib/session.ts, app/discussion-anonyme/actions.ts]
- [x] [Review][Patch] Ligne parasite/hallucinée dans les Completion Notes (même motif que Story 1.1), corrigée directement pendant le triage [1-2-choix-du-mode-de-conversation-sauvegarder-ou-ephemere.md:140]
- [x] [Review][Patch] Modification accidentelle non liée dans `epics.md` (ligne `"oui il."` insérée dans les AC de la Story 1.1) — repérée par les 3 passes de revue, corrigée [_bmad-output/planning-artifacts/epics.md:155]
- [x] [Review][Defer] Le paramètre `mode=ephemere` est posé sur la redirection mais jamais lu dans `page.tsx` — soit à exploiter (message spécifique au mode éphémère sur l'écran "prêt"), soit à supprimer [app/discussion-anonyme/actions.ts:99] — deferred, pre-existing
- [x] [Review][Defer] Visiter `?conv=<id>` sans `?etape=pret` retombe silencieusement sur l'écran de choix de mode plutôt que de gérer explicitement cet état partiel — non bloquant, pas couvert par une AC [app/discussion-anonyme/page.tsx:16-24] — deferred, pre-existing
- [x] [Review][Defer] Aucune limitation de débit sur `choisirModeSauvegarder`, qui déclenche une boucle `bcrypt.compare` en O(n) à chaque soumission — le O(n) lui-même est un compromis d'architecture assumé (Dev Notes/NFR-1), mais l'absence de limitation de débit reste un vecteur d'épuisement CPU distinct, à traiter dans un futur passage de durcissement [app/discussion-anonyme/actions.ts, lib/session.ts] — deferred, pre-existing

## Dev Notes

- **Unicité du Code recherché sur des hachages — point technique non-évident, à suivre précisément** : NFR-7 impose que le Code de récupération ne soit **jamais stocké en clair** (haché en bcrypt, AD-5). Or `bcrypt` génère un sel aléatoire à chaque hachage : deux hachages du même Code ne sont **jamais identiques** entre eux. Il est donc impossible de vérifier l'unicité d'un Code avec une requête SQL du type `WHERE recovery_code_hash = hash(code)`. La seule méthode correcte est : récupérer tous les `recovery_code_hash` non nuls existants, puis appeler `bcrypt.compare(codeCandidat, hachageExistant)` sur chacun jusqu'à trouver une correspondance (ou aucune). C'est en O(n) sur le nombre de Conversations "Sauvegarder" existantes, ce qui est acceptable à l'échelle d'un lycée (centaines de Conversations, pas millions) et cohérent avec NFR-1 (simplicité pour une équipe débutante) — ne pas essayer d'optimiser avec un index ou une table séparée non prévue par l'Architecture. [Source: ARCHITECTURE-SPINE.md#AD-5, #AD-9 (pattern similaire pour recovery_attempts), prd.md#NFR-7]
- **Le `session_token` suit exactement le même hachage bcrypt que le Code** (AD-5 : "Hachage (Code comme jeton) : bcrypt via bcryptjs"). Cette story ne fait que le générer et le hacher à la création — la lecture/comparaison du cookie au retour d'un élève (recherche par comparaison bcrypt, même limitation O(n) que ci-dessus) est le sujet de la Story 1.4, pas de celle-ci. Ne pas l'anticiper au-delà de la création du cookie et de la ligne en base.
- **Server Actions = première apparition dans le projet** (AD-3) : `app/discussion-anonyme/actions.ts` n'existe pas encore (voir Story 1.1, Dev Notes, "Fichiers non créés"). C'est la première fois que l'équipe écrit une Server Action — chaque action vérifie/produit elle-même tout ce dont elle a besoin (validation de longueur/format du Code, vérification de disponibilité), sans supposer qu'une validation côté page a déjà eu lieu. Aucune route API custom. [Source: ARCHITECTURE-SPINE.md#AD-3]
- **Aucun accès client direct à Supabase** : le Client Component du formulaire "Sauvegarder" (Task 4) ne fait *que* de l'UI et appelle la Server Action — il n'importe jamais `lib/supabase-server.ts` ni aucune clé Supabase. [Source: ARCHITECTURE-SPINE.md#AD-4]
- **`cookies()` est une API asynchrone dans Next.js 15+ (donc en 16.2.10)** : toujours écrire `const cookieStore = await cookies()` dans une Server Action, jamais `cookies()` de façon synchrone (erreur de compilation/runtime sinon). [Source: recherche web, documentation officielle Next.js, vérifiée à la date de cette story]
- **`useActionState` (React 19, ex-`useFormState`)** est le hook standard pour afficher une erreur de validation ("Code déjà pris") renvoyée par une Server Action sans reload complet ni logique client custom. Il s'importe depuis `react`, pas depuis `next/navigation` ni `react-dom`. Nécessite un Client Component (`"use client"`) autour du formulaire concerné (le formulaire "Sauvegarder" uniquement — le bouton "Éphémère" n'a pas besoin d'affichage d'erreur donc peut rester un Server Component). [Source: recherche web, react.dev/reference/react/useActionState, vérifiée à la date de cette story]
- **Conventions transverses toujours valables** : ids en `uuid`, dates en `timestamptz`, aucune PII élève stockée (le Code choisi par l'élève n'est pas une identité — ne pas le confondre avec un champ interdit), secrets en variables d'environnement Vercel. Le Code en clair ne doit **jamais** apparaître dans un log serveur (uniquement son statut haché/comparé). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Redirection après choix** : rediriger (`redirect()` de `next/navigation`) vers un état "prêt à écrire" après la création de la Conversation, plutôt que de rester sur l'écran de choix — évite qu'un rechargement de page ne re-déclenche la création d'une Conversation en double. Cet état "prêt à écrire" reste un placeholder texte à ce stade (le vrai champ de saisie est construit en Story 1.3), à l'image du placeholder final de la page en Story 1.1.
- **Pas de framework de test introduit** (toujours absent du tableau Stack de l'Architecture) — vérification manuelle uniquement pour cette story, comme pour la Story 1.1. Ne pas ajouter Jest/Vitest/Playwright silencieusement. [Source: ARCHITECTURE-SPINE.md#Stack, absence de mention]
- **Bornes du Code** : 6 à 20 caractères, alphanumérique — ces bornes sont un `[ASSUMPTION]` du PRD (§9), pas encore validées par une passe UX dédiée (aucun document UX trouvé, comme en Story 1.1). Les implémenter telles quelles ; si Charles/Basile veulent les ajuster plus tard, c'est un changement localisé à la validation de `choisirModeSauvegarder`. [Source: prd.md#FR-17, §9 hypothèses]

### Project Structure Notes

Fichiers à créer par cette story :
- `lib/session.ts` — génération/hachage/vérification du `session_token` et du Code, pose du cookie (Task 2)
- `app/discussion-anonyme/actions.ts` — Server Actions `choisirModeSauvegarder`/`choisirModeEphemere` (Task 3)
- `app/discussion-anonyme/mode-choice.tsx` — Client Component du formulaire "Sauvegarder" avec `useActionState` (Task 4)

Fichiers à modifier :
- `app/discussion-anonyme/page.tsx` — ajoute l'écran de choix de mode après le texte de divulgation existant (Story 1.1, à conserver tel quel)
- `package.json`/`package-lock.json` — ajout de `bcryptjs`

Fichiers **non créés** dans cette story, à ne pas anticiper :
- Le vrai champ de saisie de message et son envoi (`Story 1.3`)
- `lib/danger-keywords.ts`, `lib/telegram.ts` — epics/stories ultérieurs
- Toute logique de lecture du cookie au retour (`Story 1.4`) ou de vérification de Code pour récupération multi-appareil (`Story 1.5`) — cette story ne fait que la **création**

Aucune variance détectée par rapport à l'arborescence de référence de l'Architecture.

### References

- [Source: prd.md#FR-16 (§4.1)] — choix de mode avant premier message, deux options, sans jargon
- [Source: prd.md#FR-17 (§4.1)] — création du Code personnalisé, refus si déjà pris, avertissement secret
- [Source: prd.md#FR-19 (§4.1)] — mode éphémère, aucun cookie ni Code, avertissement pas de retour possible
- [Source: prd.md#NFR-7] — Code = secret jamais stocké en clair, haché
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions comme unique frontière d'écriture
- [Source: ARCHITECTURE-SPINE.md#AD-4] — aucun accès client direct à Supabase
- [Source: ARCHITECTURE-SPINE.md#AD-5] — session_token + Code, bcrypt, mode éphémère = rien de persistant
- [Source: ARCHITECTURE-SPINE.md, Modèle de données] — champs `session_token_hash`, `recovery_code_hash`, `is_ephemeral`
- [Source: epics.md#Epic-1, Story-1.2] — story source, découpage validé avec Charles et Basile le 2026-07-08
- [Source: recherche web 2026-07-08] — `cookies()` asynchrone (Next.js 15+/16), `useActionState` (React 19) — voir Dev Notes pour détails et liens

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx tsc --noEmit` : succès, aucune erreur de typage.
- `npm run lint` : succès, 0 erreur (1 warning `no-unused-vars` corrigé en retirant le paramètre `formData` inutilisé de `choisirModeEphemere`).
- `npm run build` (avec `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` factices, uniquement pour permettre la compilation) : succès, route `/discussion-anonyme` marquée dynamique (ƒ) — attendu, car elle lit désormais `searchParams` et pose potentiellement un cookie.
- `npm run start` + `curl` sur `/discussion-anonyme` : les deux options ("Sauvegarder"/"Éphémère") s'affichent avec leurs avertissements visibles avant tout clic ; le formulaire "Sauvegarder" contient bien le payload `useActionState` (`$ACTION_2:1` = `{"error":null}`) attendu de React 19.
- `curl` sur `/discussion-anonyme?etape=pret` (au moment de l'implémentation initiale de cette story) : l'état placeholder "prêt à écrire" s'affichait, sans aucun `<textarea>`/`<input type="text">`. **Note de revue (2026-07-08)** : ce constat ne reflète plus l'état actuel du code — la Story 1.3 (`MessageForm`, `envoyerMessage`) a depuis remplacé ce placeholder par le vrai champ de saisie, en développement concurrent dans les mêmes fichiers. Décision prise en revue de code : accepter cette avance comme AC #4 satisfaite de fait ; la correction fonctionnelle de `MessageForm`/`envoyerMessage` sera auditée quand la Story 1.3 passera elle-même en `review`.
- Validation du regex de Code (`node -e`) : `"abc12"` (5 car.) → refusé, `"abcde1"` (6 car.) → accepté, 20 car. → accepté, 21 car. → refusé, espace/tiret → refusé, alphanumérique mixte casse → accepté.
- **Vérification manuelle complète effectuée par Charles en local** (`.env.local` avec le vrai projet Supabase `zbkfkobylprkovgrityb`), après correction d'une erreur de configuration initiale (variables nommées `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` avec la clé "Publishable" — corrigées en `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` avec la clé "Secret", conformément à AD-4) :
  - Parcours "Sauvegarder" avec un Code valide → conversation créée, écran "prêt" affiché.
  - Même Code retenté → message "Code déjà pris" affiché sans redirection (testé en revenant explicitement sur `/discussion-anonyme` sans le paramètre `?etape=pret`, puisque F5 recharge la même URL affichée après redirection — comportement attendu, pas un bug).
  - Parcours "Éphémère" → conversation créée, écran "prêt" affiché, aucun cookie `session_token` présent avant ce test.
  - Cookie `session_token` : présent uniquement après le parcours "Sauvegarder", valeur hexadécimale de 64 caractères, expiration à ~1 an, `HttpOnly` coché, `SameSite=Lax`.
  - Table Editor Supabase : ligne "Sauvegarder" avec `session_token_hash`/`recovery_code_hash` au format bcrypt (`$2b$10$...`, jamais le Code en clair) et `is_ephemeral=false` ; ligne "Éphémère" avec les deux hachages à `NULL` et `is_ephemeral=true`.
  - Mobile/desktop : réutilise le même gabarit responsive (`max-w-xl`, classes `sm:`) déjà validé en Story 1.1 sur cette page.

### Completion Notes List

- `bcryptjs@3.0.3` ajouté en dépendance de production (typages inclus, pas de `@types/bcryptjs` nécessaire).
- `lib/session.ts` créé : génération/hachage/vérification du `session_token` et du Code (bcrypt), `isCodeAvailable` implémentant la comparaison bcrypt itérative documentée dans les Dev Notes (unicité impossible à vérifier par égalité de hachages), pose du cookie `session_token` (httpOnly, ~12 mois, `secure` en production).
- `app/discussion-anonyme/actions.ts` créé — première Server Action du projet (AD-3) : `choisirModeSauvegarder` (validation longueur/format, disponibilité, création + cookie + redirection) et `choisirModeEphemere` (création sans cookie ni Code + redirection).
- `app/discussion-anonyme/mode-choice.tsx` créé — Client Component isolé utilisant `useActionState` (React 19) pour le formulaire "Sauvegarder" uniquement ; le bouton "Éphémère" reste un Server Component/formulaire simple.
- `app/discussion-anonyme/page.tsx` modifié : texte de divulgation (Story 1.1) inchangé, ajout de l'écran de choix de mode juste après, puis état placeholder "prêt à écrire" quand `?etape=pret` (évite de rebâtir la lecture de cookie prévue en Story 1.4).
- Aucune régression identifiée sur la Story 1.1 : le texte de divulgation reste strictement identique, seule la suite de la page a changé.
- Les 4 AC et les 5 tasks sont satisfaits ; vérification manuelle complète effectuée par Charles contre le vrai projet Supabase (voir Debug Log References).

### File List

- `package.json` (modifié — ajout `bcryptjs`)
- `package-lock.json` (modifié)
- `.env.local` (modifié en local par Charles — variables renommées `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, non commité, voir `.gitignore`)
- `lib/session.ts` (nouveau)
- `app/discussion-anonyme/actions.ts` (nouveau)
- `app/discussion-anonyme/mode-choice.tsx` (nouveau)
- `app/discussion-anonyme/page.tsx` (modifié — ajout de l'écran de choix de mode)

## Change Log

- 2026-07-08 : Implémentation complète de la Story 1.2 — choix du mode de conversation (FR-16), création de Code avec vérification d'unicité par comparaison bcrypt (FR-17, NFR-7), mode éphémère sans cookie ni Code (FR-19). Server Actions et session_token introduits pour la première fois dans le projet (AD-3, AD-5). Vérification manuelle complète (Sauvegarder/Éphémère, cookie, Table Editor) effectuée par Charles.
