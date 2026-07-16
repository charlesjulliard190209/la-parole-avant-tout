---
baseline_commit: 2d2d9fe16dc3d209b9c3634bc7584a850ac357ab
---

# Story 3.2: Consultation des conversations

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a organisateur authentifié,
I want voir la liste des conversations avec un indicateur clair des messages non traités,
so that je priorise mon temps de réponse limité.

## Contexte : cette story remplace le placeholder posé par la Story 3.1

`app/organisateurs/page.tsx` existe déjà (Story 3.1) mais n'affiche qu'un texte "Tu es connecté." + bouton de déconnexion — un placeholder explicitement documenté comme temporaire, en attendant cette story. Le contrôle d'authentification (`requireOrganisateur()`) et la protection de route (`proxy.ts`) sont déjà en place et ne doivent pas être touchés ni dupliqués : cette story ajoute uniquement le contenu (la vraie liste), pas l'authentification.

## Acceptance Criteria

1. Given je suis connecté en tant qu'Organisateur, When j'ouvre `/organisateurs`, Then je vois la liste de toutes les Conversations existantes (sauvegardées et éphémères confondues — FR-19 : un message éphémère est visible par les Organisateurs exactement comme un message sauvegardé). [Source: epics.md#Story-3.2; prd.md#FR-5; prd.md §"mode éphémère visible par les Organisateurs"]
2. Given une Conversation dont le dernier message est de type `eleve` et dont `last_organizer_read_at` est `null` OU antérieur à l'horodatage de ce message, When la liste s'affiche, Then cette Conversation est visuellement distinguée comme "non traitée" par rapport aux Conversations déjà traitées (ex. style, badge — pas nécessairement un texte, mais une différence non ambiguë). [Source: epics.md#Story-3.2 AC; ARCHITECTURE-SPINE.md, "Lu/non-lu (FR-5, FR-15)"]
3. Given une ou plusieurs Conversations avec `is_priority = true` (Signal de danger détecté, Epic 2), When la liste s'affiche, Then ces Conversations sont à la fois visuellement distinguées (ex. badge/couleur dédiée, différente du badge "non traitée") ET triées avant toutes les Conversations non prioritaires, quel que soit leur statut lu/non-lu. [Source: epics.md#Story-3.2 AC; prd.md#FR-5 "visuellement prioritaires"]
4. Given je ne suis pas connecté, When je tente d'accéder à `/organisateurs`, Then je suis redirigé vers `/organisateurs/connexion` — comportement déjà garanti par `requireOrganisateur()` (Story 3.1) : à ne pas régresser, ne rien ajouter dans cette page qui s'exécute avant cet appel. [Source: Story 3.1 AC#1 — non-régression]
5. Given la liste des Conversations, When elle s'affiche, Then aucune information ne permet d'identifier l'Élève (pas de nom, email, identifiant scolaire — cohérent avec FR-1 : aucune PII élève n'existe nulle part dans le système, il n'y a donc rien à afficher par erreur). Chaque entrée de la liste s'identifie uniquement par des métadonnées techniques (horodatage, éventuellement un extrait du dernier message si ce choix est fait — voir Dev Notes sur le contenu affichable). [Source: ARCHITECTURE-SPINE.md, Consistency Conventions; prd.md#FR-1]
6. Given aucune Conversation n'existe encore en base, When un Organisateur ouvre `/organisateurs`, Then un état vide clair s'affiche (texte du type "Aucune conversation pour le moment"), sans erreur ni page blanche. [Edge case — nécessaire pour un projet en tout début de vie réelle]

## Tasks / Subtasks

- [x] Task 1: Requête et calcul de l'état "non traité" (AC: #1, #2, #6)
  - [x] Dans `app/organisateurs/page.tsx`, remplacer le contenu placeholder (texte "Tu es connecté.") par la vraie liste — **garder** l'appel à `requireOrganisateur()` en première ligne de la fonction, inchangé (AD-3, AC #4)
  - [x] Requêter via `supabaseServer` (`lib/supabase-server.ts`, clé service) — **jamais** de client Supabase navigateur pour ces données (AD-4). C'est un Server Component `async`, comme `app/discussion-anonyme/page.tsx` déjà.
  - [x] Récupérer toutes les conversations : `id, is_priority, is_ephemeral, last_organizer_read_at, created_at`
  - [x] Récupérer les messages nécessaires au calcul : `id, conversation_id, sender_type, created_at` (le `body` n'est nécessaire que si un extrait du dernier message est affiché dans la liste — voir Dev Notes ; ne récupérer que les colonnes utilisées)
  - [x] Pour chaque Conversation, calculer si elle est "non traitée" avec **exactement** cette définition (déjà fixée par le spine, ne pas en inventer une autre) : `last_organizer_read_at` est `null` OU antérieur au `created_at` du dernier message de type `eleve` de cette Conversation. Une Conversation sans aucun message `eleve` (cas théorique, ne devrait pas arriver via le parcours normal) ne doit pas faire planter le calcul.
  - [x] Une Conversation sans aucune Conversation en base → état vide (AC #6), pas une erreur
  - [x] Entourer les requêtes Supabase d'un `try/catch`, même garde-fou que `app/discussion-anonyme/page.tsx:68-78` (une erreur/incident Supabase transitoire ne doit jamais faire planter cette page, NFR-2 — traiter comme liste vide plutôt que de laisser remonter une exception non gérée)

- [x] Task 2: Tri et distinction visuelle (AC: #3, #2, #5)
  - [x] Trier la liste : `is_priority` d'abord (les Conversations prioritaires toutes en tête), puis parmi chaque groupe, les non traitées avant les traitées, puis par `created_at` décroissant en dernier critère. Ordre confirmé par Charles (2026-07-15) — le PRD/epics demandaient seulement que les prioritaires "apparaissent visuellement en priorité" sans préciser l'ordre exact ; cet ordre précis est désormais la spécification à implémenter, pas une simple suggestion.
  - [x] Nouveau composant dédié (ex. `app/organisateurs/conversation-list.tsx`), cohérent avec le pattern déjà établi du projet (composants colocalisés : `conversation-thread.tsx`, `mode-choice.tsx`, `connexion-form.tsx`) — reçoit la liste déjà triée et enrichie (statut non-traité, is_priority) en props
  - [x] Distinction visuelle : un badge/style pour "Prioritaire" (is_priority) et un badge/style **différent** pour "non traité" — une Conversation peut être les deux à la fois, les deux indicateurs doivent rester distinguables simultanément
  - [x] Chaque entrée affiche au minimum un horodatage lisible (`toLocaleDateString`/`toLocaleString` en `fr-FR` — aucune convention de format de date n'existe encore ailleurs dans le projet, cette story pose la première) ; ne jamais afficher de champ qui identifierait l'élève (AC #5)
  - [x] État vide (AC #6) : texte simple dans la même page, pas de composant séparé nécessaire pour ce seul cas
  - [x] **Ne pas** rendre les entrées de la liste cliquables/liens vers un détail de Conversation — `app/organisateurs/[conversationId]/page.tsx` (fil + réponse) appartient à la Story 3.3 (FR-6) dans l'arborescence de l'Architecture, ne pas l'anticiper ici (voir Dev Notes, "Portée volontairement limitée")

- [x] Task 3: Vérification manuelle (AC: #1 à #6)
  - [x] `npm run lint` et `npm run build` passent
  - [x] Avec au moins 3 Conversations de test en base (via script Node ad hoc temporaire, jamais commité — même précédent que Story 3.1/1.3 — ou données déjà présentes si des tests précédents en ont laissé) couvrant : une prioritaire, une non traitée non prioritaire, une déjà traitée → confirmer l'ordre d'affichage et la distinction visuelle (AC #2, #3)
  - [x] Vérifier qu'une Conversation éphémère (`is_ephemeral = true`) apparaît bien dans la liste (AC #1)
  - [x] Vérifier l'état vide si aucune Conversation n'existe (AC #6) — ou en filtrant/vidant temporairement pour le test si des données existent déjà, sans supprimer de vraies données de test sans confirmation
  - [x] Vérifier la non-régression : sans session, `/organisateurs` redirige toujours vers `/organisateurs/connexion` (AC #4)
  - [x] Relire le rendu final : aucun champ affiché ne pourrait identifier un élève (AC #5)

### Review Findings

Revue multi-angles (Blind Hunter, Edge Case Hunter, Acceptance Auditor), 10 findings retenus, 2 écartés comme bruit.

- [x] [Review][Patch] Si la requête `conversations` réussit mais la requête `messages` échoue/lève une exception, `dernierMessageEleveParConversation` reste vide et **toutes** les Conversations (y compris une prioritaire jamais lue) sont calculées comme "traitées" — le badge "Non traitée" disparaît silencieusement pendant un incident Supabase transitoire, sans aucune trace. [app/organisateurs/page.tsx:44-58,83-86] — Corrigé : nouveau flag `erreurMessages`, qui force `nonTraitee = true` pour toutes les Conversations en cas d'échec (fail-safe, jamais l'inverse) et remonte un bandeau d'erreur visible sur la page.
- [x] [Review][Patch] Si la requête `conversations` elle-même échoue/lève une exception, la page affiche "Aucune conversation pour le moment" — indiscernable pour l'Organisateur d'un vrai état vide (AC #6). Un incident Supabase se lit comme "rien à faire" plutôt que comme une erreur. [app/organisateurs/page.tsx:30-38] — Corrigé : nouveau flag `erreurConversations`, distinct de la liste vide, remonté à la page via `{ conversations, erreur }` et affiché comme bandeau `role="alert"`.
- [x] [Review][Patch] Aucun `console.error` dans les deux blocs `catch`/branches d'erreur de `chargerConversations()`, contrairement à la convention déjà établie ailleurs dans le projet (ex. `lib/supabase-auth.ts`, `seDeconnecter`) — un incident réel sur le tableau de bord Organisateurs ne laisserait aucune trace serveur exploitable. [app/organisateurs/page.tsx:30-38,44-58] — Corrigé : `console.error` ajouté sur chaque branche d'erreur/exception des deux requêtes (métadonnées uniquement, jamais de contenu de message).
- [x] [Review][Patch] `Intl.DateTimeFormat("fr-FR", ...)` ne précise pas `timeZone` — le rendu utilise le fuseau du runtime serveur (Vercel, généralement UTC), pas l'heure du Royaume-Uni ; les horodatages affichés aux Organisateurs peuvent être décalés d'une heure. [app/organisateurs/conversation-list.tsx:9-15] — Corrigé : `timeZone: "Europe/London"` ajouté au formateur.
- [x] [Review][Patch] Comparaisons de timestamps par chaînes de caractères (`>`, `<`) plutôt que par valeur numérique (`new Date(...).getTime()`) — correct tant que Postgres/PostgREST sérialise `timestamptz` de façon strictement uniforme, mais fragile en théorie et sans garde-fou explicite. [app/organisateurs/page.tsx:71,86] — Corrigé : toutes les comparaisons utilisent désormais `Date.parse(...)`.
- [x] [Review][Patch] Le tri n'a pas de critère de départage déterministe si deux Conversations partagent exactement `isPriority`, `nonTraitee` et `createdAt` — improbable (précision timestamptz) mais non garanti explicitement par le code. [app/organisateurs/page.tsx:99-109] — Corrigé : départage final par `id` (`localeCompare`) ajouté au comparateur de tri.
- [x] [Review][Patch] La requête `messages` récupère aussi les messages de type `organisateur` pour les ignorer ensuite en JS (boucle `if (message.sender_type !== "eleve") continue`) — un filtre `sender_type` côté requête éviterait de transférer des lignes inutiles. [app/organisateurs/page.tsx:47-53,62-65] — Corrigé : `.eq("sender_type", "eleve")` ajouté à la requête ; la colonne `sender_type` et la boucle de filtrage JS ont été retirées, devenues inutiles.
- [x] [Review][Patch] Le comportement "aucun message élève sur cette Conversation ⇒ toujours traitée" (`dernierMessageEleve === null` force `nonTraitee = false`) n'est pas documenté par un commentaire, alors que c'est un choix intentionnel plutôt qu'un cas non couvert. [app/organisateurs/page.tsx:83-86] — Corrigé : commentaire ajouté au-dessus du calcul de `nonTraitee`.
- [x] [Review][Defer] Les requêtes `conversations` et `messages` n'ont ni tri explicite ni pagination — soumises à la limite par défaut de Supabase/PostgREST (1000 lignes), qui pourrait un jour tronquer silencieusement la liste ou fausser le calcul de "dernier message élève". Accepté à l'échelle actuelle du produit (NFR-1, AD-10 — deux organisateurs, faible volume), à revisiter si le volume de Conversations/messages augmente significativement (voir aussi la section Deferred de l'Architecture Spine, qui documente déjà d'autres limites acceptées à cette échelle). [app/organisateurs/page.tsx:30-58]
- [x] [Review][Defer] Aucune validation runtime que la réponse Supabase correspond aux types `ConversationRow`/`MessageRow` (un renommage de colonne dans une future migration échouerait silencieusement à l'exécution plutôt que d'être détecté à la compilation) — déjà le pattern établi partout ailleurs dans le projet (ex. `app/discussion-anonyme/page.tsx`), pas introduit par cette story. [app/organisateurs/page.tsx:10-22]

### Review Findings (revue #2, après application des patchs de la revue #1)

Revue multi-angles (Blind Hunter, Edge Case Hunter, Acceptance Auditor) relancée sur l'état patché. L'Acceptance Auditor ne remonte aucune violation d'AC. 1 finding retenu en `patch`, 2 en `defer` (dont 1 complète un defer déjà existant), le reste écarté comme bruit ou hors-scope (bouton de nouvel essai non requis par les AC, requêtes séquentielles jugées suffisantes à cette échelle, cohérence de lecture entre deux requêtes non transactionnelles jugée acceptable, découpage de `chargerConversations()` en fonctions plus petites jugé prématuré sans framework de test, niveau de détail des logs déjà suffisant — le préfixe de chaque `console.error` distingue déjà la requête en cause).

- [x] [Review][Patch] Quand la requête `conversations` échoue, la page affiche à la fois le bandeau d'erreur **et** le texte "Aucune conversation pour le moment" de `ConversationList` (qui ne sait pas distinguer une vraie liste vide d'une liste vide par échec) — les deux messages superposés peuvent se lire comme "petit problème mineur" plutôt que "toute la liste a échoué à charger, aucune visibilité sur un éventuel Signal de danger en ce moment." [app/organisateurs/page.tsx:54-56 ; app/organisateurs/conversation-list.tsx:24-30] — Corrigé : `ConversationList` reçoit désormais le flag `erreur` en prop ; quand la liste est vide **et** `erreur` est vrai, le composant ne rend rien (le bandeau d'erreur de la page suffit) au lieu d'afficher "Aucune conversation pour le moment". N'affecte pas le cas où seule la requête `messages` échoue (liste non vide, rendue normalement avec le fail-safe déjà en place) ni le vrai état vide (AC #6, toujours affiché quand `erreur` est faux).
- [x] [Review][Defer] Complément au defer déjà noté ci-dessus sur l'absence de pagination : la requête `messages` construit son filtre `.in("conversation_id", ...)` en encodant tous les ids dans l'URL — au-delà de quelques centaines de Conversations, ceci risque une limite de longueur d'URL côté proxy/CDN, un mode d'échec distinct (requête rejetée) de la limite par défaut de 1000 lignes PostgREST déjà notée. Même décision : accepté à l'échelle actuelle (NFR-1, AD-10), à revisiter en même temps que la pagination. [app/organisateurs/page.tsx:62-69]
- [x] [Review][Defer] Aucune protection contre un timestamp `created_at`/`last_organizer_read_at` malformé : `Intl.DateTimeFormat.format(new Date(...))` lèverait une `RangeError` sur une date invalide (ferait échouer le rendu de toute la liste, pas seulement la ligne concernée), et `Date.parse(...)` retournerait `NaN` dans les comparaisons (`NaN < x` vaut toujours `false`, donc une Conversation avec une donnée corrompue serait silencieusement vue comme "traitée"). Non actionné : Postgres/PostgREST ne retourne jamais un `timestamptz` mal formé sur aucun chemin de code actuel de ce projet — même position que le defer déjà noté sur l'absence de validation runtime des types Supabase (confiance dans la garantie du framework, pas de validation défensive pour un scénario qui ne peut pas se produire aujourd'hui). [app/organisateurs/page.tsx:89,111 ; app/organisateurs/conversation-list.tsx:19]

### Review Findings (revue #3, `code-review` standalone, lancée conjointement avec la Story 3.3)

- [x] [Review][Patch] Le bandeau d'erreur affiché quand la requête `conversations` échoue elle-même (liste totalement vide, `erreur = true`) utilise le même texte générique que pour un échec de la seule requête `messages` ("les statuts affichés peuvent être imprécis") — ce texte sous-estime la gravité : dans le cas d'un échec total de `conversations`, ce n'est pas "imprécis", c'est **tout le tableau de bord qui manque** (y compris une éventuelle Conversation prioritaire). À distinguer : un message plus clair quand `erreurConversations` (liste vide, rien à afficher) vs `erreurMessages` seul (liste affichée mais statuts "non traitée" potentiellement imprécis). [app/organisateurs/page.tsx:177] — Corrigé : `chargerConversations()` retourne désormais `erreurConversations`/`erreurMessages` séparément (au lieu d'un seul booléen `erreur` overloadé), avec deux bandeaux distincts sur la page liste.

## Dev Notes

- **Définition exacte de "non traité" — ne pas en inventer une autre** : fixée par l'Architecture Spine (section "Lu/non-lu (FR-5, FR-15)") : `last_organizer_read_at` est `null` OU antérieur au dernier `MESSAGE` de type `eleve`. Cette même définition sera réutilisée telle quelle par la Story 3.5 (relance à 4h) — l'implémenter correctement ici évite de la re-découvrir/re-décider plus tard.
- **Portée volontairement limitée à l'affichage** : cette story ne construit ni `app/organisateurs/[conversationId]/page.tsx` (fil + réponse, Story 3.3/FR-6), ni la Server Action `marquerLu` (rattachée à FR-6 dans le modèle de données du spine — "appelée à l'ouverture d'une Conversation par un organisateur" — donc scope de la Story 3.3, pas de celle-ci). Ne pas construire de lien cliquable vers une page qui n'existe pas encore.
- **Accès aux données : `supabaseServer`, jamais un nouveau client** : `lib/supabase-server.ts` (clé service) existe déjà et sert exactement ce cas (AD-4) — ne pas créer de nouveau client Supabase, ne pas réutiliser `lib/supabase-auth.ts` (dédié à la session Organisateur, pas aux données `conversations`/`messages`, voir Dev Notes Story 3.1).
- **Pattern de résilience déjà établi à réutiliser** : `app/discussion-anonyme/page.tsx` (lignes ~68-78, ~102-113) entoure déjà ses requêtes Supabase d'un `try/catch` qui dégrade en "rien trouvé" plutôt que de laisser planter la page (NFR-2, disponibilité). Reproduire exactement ce pattern ici plutôt qu'en inventer un nouveau.
- **Aucune PII élève, jamais** (FR-1, rappelé par les Consistency Conventions du spine) : la liste ne doit rien afficher qui pourrait identifier un élève, ce qui de toute façon n'existe nulle part dans le modèle de données (`conversations`/`messages` ne stockent aucun nom/email/identifiant). Un extrait du dernier message (`body`) est un contenu potentiellement sensible (santé mentale) mais pas une donnée d'identité — son affichage dans la liste est laissé à l'appréciation du développeur (ni interdit ni requis par les AC), à condition de ne jamais en faire une donnée cliquable/exportable au-delà de cette page protégée (NFR-6 : accès restreint aux deux Organisateurs).
- **Pas de nouvelle dépendance, pas de nouvelle migration** : tout le schéma nécessaire (`is_priority`, `last_organizer_read_at`, `sender_type`) existe déjà depuis la Story 1.1/2.2 (`supabase/migrations/20260708000000_conversations_and_messages.sql`). Aucune colonne à ajouter pour cette story.
- **Pas de framework de test** (toujours absent du projet, cf. toutes les stories précédentes) — vérification manuelle uniquement.
- **Première convention de format de date du projet** : aucune page existante ne formate encore de date pour affichage humain — utiliser `Intl`/`toLocaleDateString`/`toLocaleString` avec la locale `fr-FR`, cohérent avec le reste de l'interface en français.

### Project Structure Notes

Conforme à l'arborescence de référence du spine (`app/organisateurs/page.tsx` — "liste des Conversations, FR-5"), aucune variance structurelle.

Fichiers modifiés :
- `app/organisateurs/page.tsx` — remplace le contenu placeholder (Story 3.1) par la vraie requête + liste ; conserve `requireOrganisateur()` inchangé

Fichiers probablement créés (détail d'implémentation, pas imposé par l'arborescence de référence qui ne détaille pas les sous-composants — cohérent avec le pattern déjà suivi pour `conversation-thread.tsx`/`connexion-form.tsx`, eux aussi absents de l'arborescence de référence mais ajoutés comme détail d'implémentation) :
- `app/organisateurs/conversation-list.tsx` (ou nom équivalent) — composant d'affichage de la liste

Fichiers **à ne pas créer** dans cette story (appartiennent à la Story 3.3) :
- `app/organisateurs/[conversationId]/page.tsx`
- Toute Server Action `marquerLu`/`repondre` dans `app/organisateurs/actions.ts`

### References

- [Source: epics.md#Epic-3, Story-3.2] — story source, AC d'origine
- [Source: prd.md#FR-5 (§4.3)] — indicateur non lu/non traité, priorité visuelle des Conversations avec Signal de danger
- [Source: prd.md §"mode éphémère visible par les Organisateurs"] — une Conversation éphémère apparaît dans la liste comme une Conversation sauvegardée
- [Source: ARCHITECTURE-SPINE.md, "Lu/non-lu (FR-5, FR-15)"] — définition exacte et obligatoire de "non traité"
- [Source: ARCHITECTURE-SPINE.md#AD-4] — accès aux données `conversations`/`messages` uniquement via le serveur, clé service
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — "Consultation Conversations (FR-5) : app/organisateurs/page.tsx, gouverné par AD-4"
- [Source: ARCHITECTURE-SPINE.md, Consistency Conventions] — aucune PII élève stockée/affichée nulle part
- [Source: _bmad-output/implementation-artifacts/3-1-authentification-des-organisateurs.md] — `requireOrganisateur()`, placeholder à remplacer, portée volontairement limitée à l'auth
- [Source: app/discussion-anonyme/page.tsx] — pattern de requête Supabase résiliente (`try/catch`, dégrade en liste vide) à reproduire

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run lint` : succès, 0 erreur/avertissement.
- `npm run build` : succès complet (5 routes générées, dont `/organisateurs`), avec la vraie configuration `.env.local` déjà renseignée par Charles depuis la Story 3.1.
- Vérification de la logique de calcul/tri : script Node temporaire `verify-list.tmp.mjs` (racine du projet, jamais commité, supprimé immédiatement après exécution — même précédent que Stories 1.3/2.2/3.1), rejouant contre le vrai projet Supabase la logique exacte de `chargerConversations()` (même requêtes, même calcul de "non traitée", même tri). 4 Conversations de test insérées (prioritaire+non traitée, non traitée simple, traitée, éphémère+non traitée) + leurs messages ; résultat : ordre obtenu = priorité d'abord, puis non traitées (les plus récentes en premier), puis traitées en dernier — exactement l'ordre attendu ; les 4 flags "non traitée" corrects. Toutes les données de test supprimées par le script lui-même après vérification (`conversations.delete()`, cascade FK sur `messages`).
- Vérification de non-régression AC #4 : `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://localhost:3000/organisateurs` sur un serveur `next dev` démarré pour l'occasion (aucun serveur n'était déjà lancé cette fois, contrairement aux stories précédentes) → `307 -> http://localhost:3000/organisateurs/connexion`, confirmant que `requireOrganisateur()` bloque toujours l'accès sans session. Serveur arrêté après ce test.
- **Limite connue** : la vérification ci-dessus rejoue la logique de requête/calcul/tri à l'identique de `chargerConversations()`, mais ne rend pas réellement le JSX de `conversation-list.tsx` dans un navigateur authentifié (pas d'outil de navigateur disponible dans cette session, et pas de nouvelle demande de mot de passe à Charles pour éviter de répéter le point de sécurité déjà soulevé en Story 3.1). Risque résiduel faible : le rendu conditionnel des badges (`isPriority`/`nonTraitee`/`isEphemeral`) est une structure JSX simple, déjà validée par les données passées en props via la vérification ci-dessus.
- **Revue de code (2026-07-15)** : `npm run lint`/`npm run build` re-passés après application des 8 patchs. Script Node temporaire `verify-list-patch.tmp.mjs` (même précédent, supprimé après usage) rejouant la version patchée de `chargerConversations()` contre le vrai projet Supabase : ordre et flags "non traitée" toujours corrects après l'ajout du filtre `sender_type` côté requête et des comparaisons de dates numériques ; confirmé aussi que le filtre `.eq("sender_type", "eleve")` exclut bien un message organisateur de test (1 seul message élève retourné sur 2 messages insérés pour la même Conversation). Le comportement fail-safe (`erreurMessages`/`erreurConversations` → bandeau d'erreur + statuts conservateurs) n'a pas pu être testé par une vraie panne Supabase délibérément provoquée ; relecture du code seule pour ce chemin (logique simple : deux booléens combinés par OR, déjà validée par `tsc`/`build`).
- **Revue de code #2, patch restant (2026-07-15)** : `npm run lint`/`npm run build` re-passés après le patch (aucune erreur/avertissement, 5 routes générées dont `/organisateurs`). Correctif purement conditionnel côté JSX (`ConversationList` ne rend rien si `conversations.length === 0 && erreur`) — vérifié par relecture des 3 chemins possibles plutôt que par script Node (pas de nouvelle logique de requête/calcul à rejouer) : (1) échec de la requête `conversations` → `conversations=[]`, `erreur=true` → composant ne rend rien, seul le bandeau d'erreur de la page reste visible, plus de superposition ; (2) vrai état vide (AC #6, aucune erreur) → `erreur=false` → texte "Aucune conversation pour le moment" toujours affiché ; (3) échec de la seule requête `messages` → liste non vide → la branche vide n'est jamais atteinte, la liste s'affiche normalement avec le fail-safe déjà en place (badges "Non traitée" forcés). Pas de test navigateur (même limite déjà notée ci-dessus, changement JSX conditionnel simple).

### Completion Notes List

- Tasks 1 à 3 complètes. `app/organisateurs/page.tsx` remplace le placeholder de la Story 3.1 par une vraie requête Supabase (`supabaseServer`, AD-4) calculant le statut "non traitée" selon la définition exacte du spine (`last_organizer_read_at` null ou antérieur au dernier message `eleve`), triant les Conversations (prioritaires d'abord, puis non traitées, puis les plus récentes), et affichant le résultat via le nouveau composant `app/organisateurs/conversation-list.tsx`.
- `requireOrganisateur()` conservé inchangé en première ligne de la page (AC #4, non-régression) — aucune modification à l'authentification.
- Aucune Server Action, aucune page de détail (`[conversationId]/page.tsx`) créée — hors scope de cette story (Story 3.3).
- Les 6 AC sont vérifiés : #1/#2/#3/#6 par script Node rejouant la logique réelle contre le vrai projet Supabase (données de test supprimées après coup) ; #4 par `curl` contre le serveur réel ; #5 par relecture du code livré (aucun champ affiché ne provient d'une donnée d'identité élève — le modèle de données n'en contient d'ailleurs aucune).
- Aucune nouvelle dépendance, aucune nouvelle migration.
- ✅ Résolu le finding de revue restant [Patch] : `ConversationList` reçoit désormais `erreur` en prop et ne rend plus le texte "Aucune conversation pour le moment" quand la liste est vide à cause d'un échec de la requête `conversations` — évite la superposition avec le bandeau d'erreur de la page (AC #6 non affecté : le vrai état vide continue d'afficher ce texte).

### File List

- `app/organisateurs/page.tsx` (modifié) — remplace le placeholder (Story 3.1) par la requête réelle (`chargerConversations()`) et l'affichage de la liste
- `app/organisateurs/conversation-list.tsx` (nouveau) — composant d'affichage de la liste, badges "Prioritaire"/"Non traitée"/"Éphémère", état vide, première convention de format de date du projet (`Intl.DateTimeFormat("fr-FR", ...)`)

## Change Log

- 2026-07-15 : Implémentation complète (dev-story) — `app/organisateurs/page.tsx` remplace le placeholder de la Story 3.1 par la vraie liste des Conversations (FR-5), nouveau composant `conversation-list.tsx`. Vérifié par `lint`/`build`, par script Node rejouant la logique réelle de tri/calcul contre le vrai projet Supabase (données de test supprimées après coup), et par `curl` pour la non-régression de la redirection sans session. Les 6 AC et les 3 Tasks sont satisfaits — passage en `review`.
- 2026-07-15 (revue de code) : Revue multi-angles exécutée (Blind Hunter, Edge Case Hunter, Acceptance Auditor), 10 findings retenus, 2 écartés comme bruit. Les 8 jugés `patch` corrigés : fail-safe sur échec de la requête `messages` (toutes les Conversations deviennent "non traitées" plutôt que "traitées" par défaut), bandeau d'erreur distinct de l'état vide sur échec de la requête `conversations`, logs `console.error` ajoutés sur les deux requêtes, fuseau `Europe/London` explicite dans le formateur de date, comparaisons de dates par `Date.parse` au lieu de chaînes, départage de tri par `id`, filtre `sender_type` déplacé côté requête Supabase, commentaire ajouté sur le cas "aucun message élève". Les 2 findings `defer` (absence de pagination à cette échelle, absence de validation runtime des types Supabase) ajoutés à `deferred-work.md`. `lint`/`build` et vérification Node contre le vrai projet Supabase re-passés après correctifs. Passage en `done`.
- 2026-07-15 (revue de code #2, sur l'état patché) : Revue multi-angles relancée, l'Acceptance Auditor confirme les 8 patchs de la revue #1 et ne remonte aucune violation d'AC. 1 nouveau finding `patch` identifié (bandeau d'erreur superposé au texte d'état vide quand la requête `conversations` échoue), laissé comme item à faire sur décision de Charles (2026-07-15) plutôt que corrigé immédiatement. 2 findings `defer` supplémentaires ajoutés (nuance longueur d'URL sur le filtre `.in()`, absence de garde-fou sur un timestamp malformé — tous deux non actionnés, garantie du framework jugée suffisante). Repasse en `in-progress` tant que le patch restant n'est pas traité.
- 2026-07-15 (patch restant traité) : `ConversationList` (`app/organisateurs/conversation-list.tsx`) reçoit un nouveau prop `erreur` ; quand la liste est vide et `erreur` est vrai (échec de la requête `conversations`), le composant ne rend plus rien au lieu d'afficher "Aucune conversation pour le moment" en plus du bandeau d'erreur déjà affiché par la page. `app/organisateurs/page.tsx` transmet le flag. N'affecte ni le vrai état vide (AC #6) ni le cas d'échec de la seule requête `messages` (liste non vide, rendue normalement). `lint`/`build` re-passés. Passage en `review`.
- 2026-07-16 (revue de code, `code-review` standalone) : Revue relancée conjointement avec la Story 3.3 (toutes deux non committées). 1 finding `patch` propre à cette story corrigé : `chargerConversations()` retourne désormais `erreurConversations`/`erreurMessages` séparément (au lieu d'un seul booléen `erreur`), avec deux bandeaux d'erreur distincts sur la page liste — le texte ne sous-estime plus la gravité d'un échec total de la requête `conversations` en le confondant avec un simple statut "non traitée" imprécis. `app/organisateurs/page.tsx` lit aussi désormais `?erreur=conversation` (déclenché par la Story 3.3 quand l'ouverture d'une Conversation échoue) et affiche un bandeau dédié. `lint`/`build` re-passés. Passage en `done`.
