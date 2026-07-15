---
baseline_commit: 8d3158cafedac2d25b3201280c5dbefcbc9ffd28
---

# Story 3.1: Authentification des organisateurs

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Charles ou Basile,
I want me connecter de façon sécurisée,
so that seuls nous deux puissions accéder aux conversations.

## ⚠️ Première story d'Epic 3 : nouvelle brique technique (Supabase Auth)

Contrairement à Epic 1/2, cette story introduit un mécanisme d'authentification que le dépôt n'utilise pas encore : Supabase Auth (email + mot de passe), via le package officiel `@supabase/ssr`. Ce n'est **pas** le même problème que le `session_token` fait main de `lib/session.ts` (Epic 1) — ne pas copier ce pattern ici. Supabase Auth émet des jetons JWT (access + refresh) répartis sur plusieurs cookies, avec expiration et rafraîchissement automatique : les reconstruire à la main serait fragile et hors du principe NFR "équipe de deux développeurs débutants". `@supabase/ssr` est le package officiel Supabase pour gérer cela côté Next.js App Router — voir Dev Notes pour le pattern exact.

## Acceptance Criteria

1. Given je ne suis pas connecté, When je tente d'accéder à `/organisateurs` (ou toute sous-page), Then je suis redirigé vers l'écran de connexion (`/organisateurs/connexion`) sans qu'aucun contenu protégé ne soit jamais renvoyé au navigateur. [Source: epics.md#Story-3.1; prd.md#FR-4]
2. Given je saisis l'email et le mot de passe d'un des deux comptes Organisateur, When je soumets le formulaire de connexion, Then je suis authentifié et redirigé vers `/organisateurs`, et ma session persiste (cookies) au-delà du rechargement de page / de la fermeture de l'onglet, jusqu'à expiration ou déconnexion explicite. [Source: prd.md#FR-4; ARCHITECTURE-SPINE.md#AD-8]
3. Given je saisis des identifiants invalides (email inconnu OU mot de passe incorrect), When je soumets le formulaire, Then un message d'erreur **générique et identique** s'affiche dans les deux cas (ne jamais indiquer si l'email existe — même principe que l'erreur de Code invalide, FR-18), sans exception non gérée ni page d'erreur brute. [Source: ARCHITECTURE-SPINE.md, Consistency Conventions > Erreurs]
4. Given exactement deux comptes Organisateur existent, When on examine le produit (code et interface), Then aucun flux d'inscription en libre-service n'est exposé — pas de page/Server Action de création de compte, pas de lien "créer un compte" nulle part ; les deux comptes sont provisionnés uniquement à la main dans le dashboard Supabase. [Source: epics.md#Story-3.1 AC; ARCHITECTURE-SPINE.md#AD-8]
5. Given je suis connecté et que je clique sur "Se déconnecter", When l'action se termine, Then ma session est invalidée et je suis redirigé vers `/organisateurs/connexion` ; une tentative d'accès directe à `/organisateurs` après déconnexion redéclenche le comportement de l'AC #1. [Source: nécessaire pour vérifier manuellement l'AC #1 après connexion — pas de flux "connecté à vie" sans déconnexion possible]

## Tasks / Subtasks

- [x] Task 1: Ajouter `@supabase/ssr` et le client Supabase Auth basé sur cookies (AC: #1, #2, #5)
  - [x] `npm install @supabase/ssr` (nouvelle dépendance officielle Supabase, cohérente avec AD-2 — ce n'est pas un nouveau framework, juste l'utilitaire officiel de gestion de session Supabase pour Next.js)
  - [x] Nouvelle variable d'environnement **serveur uniquement** `SUPABASE_PUBLISHABLE_KEY` (clé "Publishable"/anon du dashboard Supabase, cf. commentaire déjà présent dans `.env.local.example`) — **ne jamais la préfixer `NEXT_PUBLIC_`** : ce produit ne construit aucun client Supabase navigateur (AD-3/AD-4, aucune Server Action de cette story n'a besoin d'un client Supabase côté client), donc rien ne justifie de l'exposer au bundle client. C'est une défense en profondeur volontairement plus stricte que le strict nécessaire : la revue d'architecture (`reviews/review-rubric.md`, note sur AD-4) prévenait déjà contre l'ajout "innocent" d'un `NEXT_PUBLIC_SUPABASE_ANON_KEY" par erreur de débutant — ne pas reproduire ce risque ici. Ajouter la ligne (vide) à `.env.local.example` avec un commentaire équivalent à celui de `SUPABASE_SERVICE_ROLE_KEY`, puis renseigner la vraie valeur dans `.env.local` (jamais commité).
  - [x] Créer `lib/supabase-auth.ts`, distinct de `lib/supabase-server.ts` (qui reste dédié à la clé service pour `conversations`/`messages`/`recovery_attempts`, AD-4 — ne pas mélanger les deux concerns). Exporter deux fonctions basées sur `createServerClient` de `@supabase/ssr` :
    - une pour Server Components/Server Actions, utilisant `cookies()` de `next/headers` (pattern `getAll()`/`setAll()` — voir doc officielle citée dans Dev Notes) ;
    - une pour le proxy (Task 2), utilisant les cookies de la `NextRequest`/`NextResponse` (signature différente de la précédente : le proxy ne peut pas utiliser `next/headers`).
  - [x] Ces deux clients utilisent `process.env.SUPABASE_URL` (déjà existant) + `process.env.SUPABASE_PUBLISHABLE_KEY` (nouveau) — **jamais** la clé service ici : la clé service bypass toute vérification, elle n'a pas de notion "d'utilisateur connecté" au sens Auth.

- [x] Task 2: `proxy.ts` à la racine du projet — protection de `/organisateurs` (AC: #1)
  - [x] Appelle le client proxy de `lib/supabase-auth.ts`, rafraîchit la session (pattern officiel `@supabase/ssr`) ; **déviation par rapport au plan initial** : contrôle optimiste via `getClaims()` (vérification JWT locale), pas `getUser()` — voir Dev Agent Record pour la raison (Next.js 16.1 déprécie `middleware.ts`/déconseille l'appel réseau lourd dans le proxy). Le contrôle authoritatif `getUser()` a été déplacé dans `requireOrganisateur()` (`lib/supabase-auth.ts`), appelé par `app/organisateurs/page.tsx`.
  - [x] `matcher` scopé à `/organisateurs/:path*` uniquement — ne touche jamais `/discussion-anonyme` ni `/` (pas de latence ni de cookie supplémentaire sur le parcours élève, qui a son propre mécanisme de session indépendant, AD-5)
  - [x] Exclut explicitement `/organisateurs/connexion` de la vérification (sinon boucle de redirection infinie : la page de connexion elle-même serait protégée par... la connexion)
  - [x] Si aucun JWT valide et route protégée demandée → `NextResponse.redirect` vers `/organisateurs/connexion`

- [x] Task 3: Écran de connexion (AC: #2, #3, #4)
  - [x] `app/organisateurs/connexion/page.tsx` — Server Component simple, rend `<ConnexionForm />`
  - [x] `app/organisateurs/connexion/connexion-form.tsx` — Client Component, `"use client"`, `useActionState(seConnecter, initialState)` (même pattern que `mode-choice.tsx`/`message-form.tsx` : champs email + mot de passe, bouton désactivé pendant `isPending`, erreur affichée avec `role="alert"`)
  - [x] `app/organisateurs/actions.ts` — nouvelle Server Action `seConnecter(prevState, formData)` :
    - lit email/mot de passe du `formData`
    - appelle `supabase.auth.signInWithPassword({ email, password })` via le client Server Action de `lib/supabase-auth.ts` (qui pose lui-même les cookies de session en cas de succès — pas de gestion manuelle de cookie ici, contrairement à `setSessionCookie` d'Epic 1)
    - en cas d'échec (email inconnu OU mot de passe incorrect OU erreur réseau/Supabase) → retourne le **même** message d'erreur générique dans les trois cas (AC #3), jamais l'erreur brute de Supabase
    - en cas de succès → `redirect("/organisateurs")`
    - `console.error` uniquement des métadonnées techniques en cas d'échec inattendu (jamais l'email ni le mot de passe saisis), cohérent avec la convention "Logs & confidentialité" du spine

- [x] Task 4: Page protégée placeholder + déconnexion (AC: #1, #5)
  - [x] `app/organisateurs/page.tsx` — Server Component minimal (ex. "Connecté" + bouton de déconnexion). **Ne pas construire ici la vraie liste des conversations** : ce fichier appartient à FR-5/Story 3.2 dans l'arborescence de l'Architecture ; cette story ne pose qu'un placeholder protégé, sur le même principe que le placeholder `?etape=pret` posé par la Story 1.2 et complété par la Story 1.3. **Déviation par rapport au plan initial** : cette page appelle elle-même `requireOrganisateur()` (`getUser()`, authoritatif) plutôt que de compter uniquement sur le proxy (qui ne fait plus qu'un contrôle optimiste, voir Task 2) — cohérent avec AD-3 ("chaque Server Action/frontière vérifie elle-même... jamais une vérification supposée déjà faite ailleurs"). Toute future Server Action de mutation (Story 3.2+, ex. `répondre`, `marquerLu`) devra de même appeler `requireOrganisateur()` ou `getUser()` dans son propre corps.
  - [x] Nouvelle Server Action `seDeconnecter()` dans `app/organisateurs/actions.ts` : appelle `supabase.auth.signOut()` via le client Server Action, puis `redirect("/organisateurs/connexion")`

- [x] Task 5: Configuration manuelle du dashboard Supabase (AC: #4)
  - [x] Provisionner les deux comptes Organisateur — fait par Charles (2026-07-15), confirmé par lui
  - [x] Vérifier/désactiver "Allow new users to sign up" (Authentication > Providers > Email) sur le projet Supabase distant — fait par Charles (2026-07-15), confirmé par lui
  - [x] Confirmer que RLS reste activée en deny-by-default sur `conversations`/`messages`/`recovery_attempts` — vérifié par Charles dans le dashboard (Table Editor + onglet Policies vide sur les 3 tables), et confirmé indépendamment par relecture des migrations (`20260708000000_conversations_and_messages.sql:32-33`, `20260709000000_recovery_attempts.sql:19` : `enable row level security` sur les 3 tables, aucun `CREATE POLICY` dans le dépôt)

- [x] Task 6: Vérification manuelle (AC: #1 à #5)
  - [x] `npm run lint` et `npm run build` passent — build relancé avec la vraie `SUPABASE_PUBLISHABLE_KEY` (fournie par Charles), succès complet, 5 routes générées
  - [x] Sans cookie de session Auth : accéder à `/organisateurs` → redirigé vers `/organisateurs/connexion` (AC #1) — vérifié par `curl` sur le serveur `next dev` déjà lancé par Charles : `307 -> http://localhost:3000/organisateurs/connexion`
  - [x] Connexion avec un compte Organisateur réel → réussie (AC #2) — vérifié par un script Node ad hoc (même pattern que la Story 1.3 : appel direct à `supabase.auth.signInWithPassword` avec la clé publishable, exactement la logique utilisée par `seConnecter`), supprimé immédiatement après exécution ; identifiants fournis directement par Charles dans la conversation et utilisés une seule fois, jamais affichés ni écrits dans un fichier persistant
  - [x] Email inconnu / mot de passe incorrect → erreur générique identique dans les deux cas (AC #3) — vérifié par le même script : Supabase renvoie déjà `"Invalid login credentials"` dans les deux cas (aucune fuite d'information sur l'existence d'un compte), et `seConnecter` la remplace de toute façon par son propre message générique
  - [x] Déconnexion → redirection vers `/organisateurs/connexion` (AC #5) — le script appelle `signOut()` après le test de connexion réussie ; combiné à la vérification `curl` ci-dessus (absence de session ⇒ toujours redirigé), confirme le comportement complet du cycle connexion/déconnexion
  - [x] Aucun log serveur ne contient un mot de passe ou un email en clair — relecture de `seConnecter`/`seDeconnecter` : le seul `console.error` logue `error.message` de Supabase (ex. "Invalid login credentials"), jamais l'email ni le mot de passe saisis
  - [x] Aucune page/lien d'inscription en libre-service dans le code livré (AC #4) — confirmé par relecture : aucune page/action de création de compte dans `app/organisateurs/`

### Review Findings

Revue multi-angles (8 finders + vérification 1-vote), 10 findings retenus. Décision de Charles (2026-07-15) : corriger d'abord les 4 jugés indispensables par l'agent, puis (sur demande explicite de Charles) les 6 restants aussi.

- [x] [Review][Patch] `getClaims()` peut lever une exception non `AuthError` (JSON invalide dans un cookie de session corrompu), non rattrapée dans `proxy.ts` → 500 au lieu d'une redirection propre [proxy.ts:22] — Corrigé : `getClaims()` enveloppé dans un `try/catch`, toute exception traitée comme "non authentifié" (redirection), jamais une erreur serveur brute.
- [x] [Review][Patch] `seDeconnecter` avalait l'erreur de `supabase.auth.signOut()` sans la logguer, contrairement à `seConnecter` dans le même fichier [app/organisateurs/actions.ts:45] — Corrigé : erreur désormais déstructurée et logguée (jamais l'email/mot de passe, cohérent avec la convention du spine).
- [x] [Review][Patch] `seDeconnecter` ne vérifiait elle-même aucune authentification, contrairement à la convention AD-3 déjà appliquée à `seConnecter` et à tout `app/discussion-anonyme/actions.ts` [app/organisateurs/actions.ts:43] — Corrigé : ajout d'un appel à `requireOrganisateur()` en tête de fonction, pose le même précédent pour les futures Server Actions d'Epic 3 (répondre, marquerLu).
- [x] [Review][Patch] Sur un rafraîchissement de session raté, `proxy.ts` retournait un `NextResponse.redirect()` neuf au lieu de `response()`, perdant les cookies déjà nettoyés par `getClaims()`/`getSession()` [proxy.ts:28] — Corrigé : nouvelle fonction `redirectToConnexion()` qui copie les cookies de `response()` sur la redirection avant de la renvoyer. Bonus : la vérification du chemin `/organisateurs/connexion` a été déplacée avant l'appel à `getClaims()` (évite ce calcul inutile sur la page de connexion elle-même), et le commentaire en tête de fichier a été corrigé pour ne plus affirmer à tort qu'aucun appel réseau n'a jamais lieu (`getClaims()` retombe sur un appel réseau si le projet Supabase n'utilise pas de clés de signature JWT asymétriques — à vérifier par Charles dans le dashboard si la latence devient sensible).
- [x] [Review][Patch] Le `catch` vide de `createSupabaseAuthServerClient` avalait toute erreur d'écriture de cookie sans trace, y compris depuis les Server Actions où une telle écriture doit normalement réussir [lib/supabase-auth.ts:40] — Corrigé : `console.error` ajouté (jamais bloquant, NFR-2), pour qu'un futur incident (connexion "réussie" sans session réellement posée) laisse une trace exploitable.
- [x] [Review][Patch] `requireOrganisateur()` n'avait pas de cache par requête [lib/supabase-auth.ts:89] — Corrigé : enveloppée dans `cache()` de React, les appels multiples dans une même requête (futurs layout/page/Server Action, Story 3.2+) partagent désormais un seul `getUser()`.
- [x] [Review][Patch] Exclusion de `/organisateurs/connexion` par égalité stricte, pas par préfixe [proxy.ts:24] — Corrigé : `startsWith("/organisateurs/connexion/")` ajouté en plus de l'égalité exacte, couvre par avance une future sous-route (ex. mot de passe oublié) sans qu'il faille revenir modifier ce fichier.
- [x] [Review][Patch] `requireOrganisateur()` vérifiait "un utilisateur Supabase authentifié existe", pas "c'est spécifiquement un des deux comptes Organisateur" [lib/supabase-auth.ts:89] — Corrigé : nouvelle allowlist `ORGANISATEUR_EMAILS` (variable d'env, comparaison insensible à la casse), vérifiée en plus de `getUser()`. Nouvelle variable documentée dans `.env.local.example` ; `.env.local` pré-rempli avec l'email de Charles (déjà connu de cette conversation), un `TODO` demande d'ajouter celui de Basile.
- [x] [Review][Patch] Duplication du pattern "vérifier variable d'env présente, sinon throw" entre `lib/supabase-server.ts` et `lib/supabase-auth.ts` [lib/supabase-auth.ts:10] — Corrigé : nouveau `lib/env.ts` (`requireEnv(name)`), réutilisé par les deux fichiers ainsi que par la nouvelle vérification `ORGANISATEUR_EMAILS`.
- [ ] [Review][Defer] `getClaims()` peut faire un appel réseau interne si les clés de signature JWT du projet Supabase ne sont pas asymétriques, contredisant partiellement la justification "pas d'appel réseau" — reste en `Defer` : le commentaire trompeur a été corrigé (voir patch plus haut), mais la vérification elle-même se fait dans le dashboard Supabase (Authentication > Settings > JWT), hors de portée du code — à faire par Charles s'il veut confirmer la latence réelle de cette route.

## Dev Notes

- **Pourquoi `@supabase/ssr` et pas un mécanisme fait main comme `lib/session.ts`** : Supabase Auth gère des jetons JWT (access token + refresh token) potentiellement volumineux, répartis automatiquement sur plusieurs cookies, avec expiration et rafraîchissement transparent. Reconstruire cette mécanique à la main (comme le `session_token` bcrypt d'Epic 1, pensé pour un secret opaque simple) serait une réinvention fragile d'un problème déjà résolu par le package officiel — pattern confirmé par la documentation Supabase actuelle (recherche web 2026-07-10, doc officielle `supabase.com/docs/guides/auth/server-side/nextjs`) : package `@supabase/ssr`, client `createServerClient` avec adaptateur cookies `getAll()`/`setAll()`, `middleware.ts` dédié au rafraîchissement de session. Utiliser ce pattern, pas une variante inventée.
- **`getUser()`, jamais `getSession()` seul, pour une décision de sécurité** : la doc officielle est explicite — `getSession()` exécuté côté serveur ne revalide pas forcément le jeton (il peut lire un jeton expiré/falsifié depuis le cookie sans vérification), alors que `getUser()` fait un appel réseau au serveur Auth Supabase pour confirmer la validité. Le middleware (Task 2) et toute future vérification d'authentification dans une Server Action doivent utiliser `getUser()`. Donnée sensible en jeu (messages liés à la santé mentale de mineurs, cf. PRD §10 Conformité) : ne pas transiger sur ce point pour gagner en latence.
- **Ne pas exposer `SUPABASE_PUBLISHABLE_KEY` au navigateur (`NEXT_PUBLIC_`)** : ce produit n'a et n'aura besoin d'aucun client Supabase côté navigateur (AD-3 : toute écriture passe par une Server Action ; AD-4 : le navigateur ne parle jamais directement à Supabase pour `conversations`/`messages`/`recovery_attempts`). La revue d'architecture (`_bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/reviews/review-rubric.md`, note sur AD-4) signalait déjà ce risque précis : *"si l'un des deux devs ajoute un jour un client `NEXT_PUBLIC_SUPABASE_ANON_KEY` pour une raison sans rapport (erreur classique de débutant), ces tables deviennent accessibles depuis la clé anon sans garde-fou supplémentaire"*. RLS deny-by-default protège déjà ces trois tables contre ce scénario (AD-4, filet de sécurité déjà en place) — garder la clé publishable strictement serveur est une précaution supplémentaire, pas une nécessité de sécurité absolue, mais elle coûte zéro effort et évite d'introduire ce risque avant même qu'il ne soit nécessaire.
- **Deux clients Supabase distincts, deux concerns distincts** : `lib/supabase-server.ts` (existant, clé service) sert exclusivement `conversations`/`messages`/`recovery_attempts`, jamais l'authentification Organisateur. `lib/supabase-auth.ts` (nouveau, cette story) sert exclusivement la session Organisateur (clé publishable + cookies), jamais l'accès aux données élève. Ne pas fusionner ces deux fichiers ni réutiliser l'un pour l'usage de l'autre.
- **Portée volontairement limitée à l'authentification** : cette story ne construit ni la liste des conversations (Story 3.2, qui possède le vrai contenu de `app/organisateurs/page.tsx` dans l'arborescence de l'Architecture), ni aucune vérification d'auth dans une Server Action de mutation de conversation (n'existent pas encore). Ne pas anticiper leur logique ici — seulement poser `lib/supabase-auth.ts` comme fondation réutilisable.
- **"Mot de passe oublié" hors scope** : ni le PRD ni les epics ne demandent ce flux pour cette story (deux comptes connus de deux développeurs). Supabase Auth le propose nativement si besoin plus tard, mais ne pas le construire maintenant — scope non demandé.
- **Aucune nouvelle table/migration** : les comptes Organisateur vivent dans le schéma interne `auth.users` de Supabase (géré par Supabase Auth lui-même), pas dans une table du modèle de données de ce spine. `supabase/migrations/` n'est pas concerné par cette story.
- **Conventions transverses toujours valables** : aucun log serveur ne doit contenir un mot de passe ou un email en clair (Consistency Conventions > Logs & confidentialité) ; toute clé (`SUPABASE_PUBLISHABLE_KEY` incluse) est une variable d'environnement Vercel, jamais commitée.
- **Pas de framework de test** (toujours absent du projet) — vérification manuelle uniquement, comme toutes les stories précédentes.

### Project Structure Notes

Fichiers à créer (variance par rapport à l'arborescence de référence du spine — le spine liste `app/organisateurs/{connexion/page.tsx,page.tsx,actions.ts}` mais ne détaille pas les fichiers de support d'authentification, qui n'existaient pas encore au moment où le spine a été écrit) :
- `middleware.ts` (racine du projet) — absent de l'arborescence de référence, nécessaire pour le rafraîchissement de session `@supabase/ssr` (les Server Components ne peuvent pas écrire de cookies eux-mêmes)
- `lib/supabase-auth.ts` — absent de l'arborescence de référence (qui ne liste que `lib/supabase-server.ts`), nécessaire pour séparer le concern "session Organisateur" du concern "accès données élève" (voir Dev Notes)
- `app/organisateurs/connexion/page.tsx`, `app/organisateurs/connexion/connexion-form.tsx` — conforme à l'arborescence de référence (`connexion/page.tsx`), le composant client `connexion-form.tsx` est un détail d'implémentation cohérent avec le pattern déjà établi (`mode-choice.tsx`, `message-form.tsx`)
- `app/organisateurs/actions.ts` — conforme à l'arborescence de référence
- `app/organisateurs/page.tsx` — conforme à l'arborescence de référence, mais **placeholder minimal seulement** dans cette story (voir Task 4) ; Story 3.2 le complète avec la vraie liste des conversations

Fichiers modifiés :
- `package.json`/`package-lock.json` — ajout de `@supabase/ssr`
- `.env.local.example` — ajout de `SUPABASE_PUBLISHABLE_KEY`
- `.env.local` — valeur réelle renseignée localement (jamais commitée, déjà dans `.gitignore`)

Aucune autre variance détectée.

### References

- [Source: prd.md#FR-4 (§4.1)] — authentification des deux Organisateurs, aucun accès sans authentification, pas de création de compte en libre-service
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions, chaque action vérifie elle-même son autorisation
- [Source: ARCHITECTURE-SPINE.md#AD-4] — aucun accès client direct à Supabase pour conversations/messages/recovery_attempts ; RLS deny-by-default en filet
- [Source: ARCHITECTURE-SPINE.md#AD-8] — Supabase Auth email/mot de passe, exactement deux comptes provisionnés manuellement
- [Source: ARCHITECTURE-SPINE.md, Consistency Conventions] — erreurs génériques, logs sans secret/PII, clés en variable d'environnement
- [Source: ARCHITECTURE-SPINE.md, Arborescence source] — `app/organisateurs/{connexion/page.tsx,page.tsx,actions.ts}`
- [Source: ARCHITECTURE-SPINE.md, reviews/review-rubric.md, note AD-4] — risque identifié d'un `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposant conversations/messages sans le filet RLS
- [Source: epics.md#Epic-3, Story-3.1] — story source, AC d'origine
- [Source: recherche web 2026-07-10, supabase.com/docs/guides/auth/server-side/nextjs] — pattern `@supabase/ssr`, `createServerClient`, `middleware.ts`, `getUser()` vs `getSession()`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- **Déviation découverte en cours d'implémentation, hors de ce que la story pouvait anticiper** : `npm run build` a émis `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead` sur Next.js 16.2.10 (la version verrouillée par le spine, AD-2). Recherche web (2026-07-10/15, `nextjs.org/docs/messages/middleware-to-proxy`, blog Next.js 16) : `middleware.ts` est remplacé par `proxy.ts` (fonction exportée renommée `proxy`), et Next.js 16.1 recommande explicitement une architecture "Thin Proxy" — contrôle **optimiste** (JWT validé localement, ex. `getClaims()`) dans le proxy, contrôle **authoritatif** (`getUser()`, revalidé réseau) dans le Server Component/Server Action protégé. En conséquence : renommé `middleware.ts` → `proxy.ts` (fonction `proxy`, toujours `matcher: ["/organisateurs/:path*"]`), remplacé `getUser()` par `getClaims()` dans le proxy, et ajouté `requireOrganisateur()` (nouvelle fonction exportée de `lib/supabase-auth.ts`, utilise `getUser()`) appelée par `app/organisateurs/page.tsx` comme contrôle authoritatif. `createSupabaseAuthMiddlewareClient` renommé `createSupabaseAuthProxyClient` pour cohérence. Ce n'est pas un ajout hors scope : c'est la même protection prévue par la story (AC #1), juste répartie sur les deux couches recommandées par la version de Next.js déjà verrouillée par le spine, au lieu de tout mettre dans un seul fichier `middleware.ts` déprécié.
- `npm run lint` : succès, 0 erreur/avertissement.
- `npm run build` : échoue tel quel car `SUPABASE_PUBLISHABLE_KEY` est vide dans `.env.local` (volontairement laissé vide, voir ci-dessous) — `lib/supabase-auth.ts` lève une exception au chargement du module si la variable est absente (même pattern que `lib/supabase-server.ts`/`SUPABASE_SERVICE_ROLE_KEY`, comportement attendu, pas un bug). Pour confirmer que le reste de la compilation (TypeScript, routes, `proxy.ts` reconnu comme "Proxy (Middleware)" dans la sortie du build) est structurellement correct, la valeur a été temporairement remplacée par une clé factice (`sb_publishable_dummy_for_build_smoketest_only`, jamais commitée) directement dans `.env.local`, le build relancé (succès complet, 5 routes générées dont `/organisateurs` et `/organisateurs/connexion`), puis la valeur vide restaurée immédiatement après. Aucune tentative de récupérer la vraie clé via `supabase projects api-keys` (bloquée par le sandbox — imprimerait les clés API en clair dans la transcription, refus légitime).
- **Reprise après le blocage (2026-07-15, même jour)** : Charles a renseigné `SUPABASE_PUBLISHABLE_KEY` (vraie valeur), provisionné les deux comptes Organisateur, désactivé "Allow new users to sign up", et confirmé RLS deny-by-default sur les 3 tables élève dans le dashboard. `npm run build` relancé avec la vraie clé : succès complet.
- Charles a ensuite fourni ses identifiants réels directement dans la conversation pour accélérer la vérification (email + mot de passe en clair dans le chat). **Point de sécurité signalé à Charles** : un mot de passe collé dans une conversation reste dans l'historique — recommandation de le changer une fois la vérification terminée. Identifiants utilisés une seule fois, jamais affichés dans une sortie de commande, jamais écrits dans un fichier suivi par git.
- Vérification AC #1 : `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}"  http://localhost:3000/organisateurs` (sans cookie, sur le serveur `next dev` déjà lancé par Charles — non redémarré, pour éviter l'incident de la Story 1.3) → `307 -> http://localhost:3000/organisateurs/connexion`.
- Vérification AC #2/#3/#5 : script Node temporaire `verify-auth.tmp.mjs` (racine du projet, jamais commité, supprimé immédiatement après exécution) rejouant la logique exacte de `seConnecter`/`seDeconnecter` via `@supabase/supabase-js` + la clé publishable — même précédent que la Story 1.3. Résultat : connexion avec les vrais identifiants → session obtenue ; déconnexion → session invalidée ; mauvais mot de passe et email inconnu → tous deux refusés par Supabase avec le même message `"Invalid login credentials"` (aucune fuite d'information sur l'existence d'un compte), remplacé de toute façon par le message générique français de `seConnecter`.
- Cette vérification couvre la logique d'authentification réelle (Supabase) et le blocage de route (proxy), mais pas un clic-à-clic complet dans le navigateur (pas d'outil de navigateur disponible dans cette session) — risque résiduel faible : le formulaire (`connexion-form.tsx`) suit exactement le pattern déjà éprouvé de `mode-choice.tsx`/`message-form.tsx`.

### Completion Notes List

- Tasks 1 à 6 complètes. `@supabase/ssr` installé, `lib/supabase-auth.ts` (client Server Action/Server Component + client proxy + `requireOrganisateur()`), `proxy.ts` (protection optimiste de `/organisateurs/*`), écran de connexion (`app/organisateurs/connexion/{page.tsx,connexion-form.tsx}`), Server Actions `seConnecter`/`seDeconnecter` (`app/organisateurs/actions.ts`), page protégée placeholder (`app/organisateurs/page.tsx`, contrôle authoritatif via `requireOrganisateur()`).
- `npm run lint` et `npm run build` passent avec la vraie configuration. Les 5 AC sont vérifiés : #1 et le cycle connexion/déconnexion par script + `curl` contre le vrai projet Supabase et le serveur réel ; #4 par relecture du code livré.
- Configuration manuelle Supabase (Task 5) faite par Charles : comptes Organisateur provisionnés, inscription publique désactivée, RLS deny-by-default confirmée sur `conversations`/`messages`/`recovery_attempts`.
- Aucune valeur réelle (email, mot de passe, clé) n'a été inventée ni committée — cohérent avec le précédent établi en Story 2.3. Le mot de passe réel de Charles a transité par cette conversation (voir Debug Log) ; recommandation transmise de le changer.

### File List

- `package.json`, `package-lock.json` — ajout de la dépendance `@supabase/ssr`
- `.env.local.example` — ajout de `SUPABASE_PUBLISHABLE_KEY` et `ORGANISATEUR_EMAILS` (documentées, vides)
- `.env.local` — ajout de `SUPABASE_PUBLISHABLE_KEY` (renseignée par Charles) et `ORGANISATEUR_EMAILS` (email de Charles pré-rempli, TODO pour celui de Basile ; jamais commité)
- `lib/env.ts` (nouveau, ajouté pendant le code review) — `requireEnv(name)`, garde-fou fail-fast partagé
- `lib/supabase-auth.ts` (nouveau ; modifié pendant le code review — log ajouté dans le `catch` de `setAll`, `requireEnv` réutilisé, `requireOrganisateur()` enveloppée dans `cache()` et vérifie désormais `ORGANISATEUR_EMAILS`) — client Auth Server Component/Server Action, client Auth proxy, `requireOrganisateur()`
- `lib/supabase-server.ts` (modifié pendant le code review — `requireEnv` réutilisé au lieu du garde-fou dupliqué)
- `proxy.ts` (nouveau ; modifié pendant le code review — `try/catch` autour de `getClaims()`, cookies préservés sur la redirection, exclusion de `/organisateurs/connexion` déplacée avant l'appel Supabase et étendue en préfixe) — protection optimiste de `/organisateurs/*` (remplace le `middleware.ts` initialement prévu par la story, déprécié sur Next.js 16.1+, voir Debug Log)
- `app/organisateurs/actions.ts` (nouveau ; modifié pendant le code review — `seDeconnecter` vérifie désormais l'authentification elle-même et logue l'erreur de `signOut()`) — Server Actions `seConnecter`, `seDeconnecter`
- `app/organisateurs/connexion/page.tsx` (nouveau)
- `app/organisateurs/connexion/connexion-form.tsx` (nouveau)
- `app/organisateurs/page.tsx` (nouveau) — placeholder protégé, appelle `requireOrganisateur()`

## Change Log

- 2026-07-15 (matin) : Implémentation des Tasks 1 à 4 (dépendance `@supabase/ssr`, `lib/supabase-auth.ts`, protection `/organisateurs/*`, écran de connexion, page placeholder + déconnexion). Déviation par rapport au plan initial de la story : `middleware.ts` remplacé par `proxy.ts` + contrôle authoritatif déplacé dans `app/organisateurs/page.tsx` via `requireOrganisateur()`, suite à la dépréciation de `middleware.ts` détectée sur Next.js 16.2.10 pendant le build (voir Debug Log). Story bloquée en `in-progress` : Task 5 nécessitait une action de Charles hors de la portée de cet agent.
- 2026-07-15 (suite, même jour) : Charles a réalisé la configuration manuelle Supabase (Task 5) et fourni ses identifiants pour la vérification finale. Tasks 5 et 6 complétées (vérification par script Node + `curl` contre le vrai projet). Tous les AC satisfaits — passage en `review`.
- 2026-07-15 (revue de code) : Revue multi-angles exécutée (8 finders + vérification), 10 findings retenus. Sur décision de Charles, les 4 jugés indispensables ont été corrigés (`proxy.ts`, `app/organisateurs/actions.ts`, `lib/supabase-auth.ts` — voir Review Findings) : exception non rattrapée sur cookie corrompu, erreur de déconnexion avalée, `seDeconnecter` sans vérification d'authentification, cookies perdus sur redirection après échec de rafraîchissement. `lint`/`build` revérifiés, comportement de redirection re-testé par `curl`.
- 2026-07-15 (suite de la revue, sur demande explicite de Charles) : les 6 findings restants corrigés aussi, sauf un qui n'est pas du code (vérification de config dans le dashboard Supabase, laissée en Defer). Ajouts : `lib/env.ts` (garde-fou d'env partagé), `requireOrganisateur()` mise en cache par requête (`cache()` de React), nouvelle allowlist `ORGANISATEUR_EMAILS` (`requireOrganisateur()` vérifie désormais que l'utilisateur Supabase est spécifiquement l'un des deux comptes Organisateur, pas n'importe quel compte authentifié), exclusion de `/organisateurs/connexion` étendue en préfixe. `lint`/`build`/`curl` revérifiés.
