---
name: 'Review adversarial — Architecture Spine'
type: review
target: '_bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md'
method: 'construction de deux unités indépendantes (une par développeur) conformes lettre à lettre au spine, testées pour incompatibilité mutuelle'
created: '2026-07-08'
---

# Review adversarial — Architecture Spine "La Parole Avant Tout"

## Méthode

Pour chaque paire candidate, je construis deux Server Actions (ou une Server Action + une tâche planifiée) que deux développeurs différents pourraient écrire **chacun en respectant tous les AD à la lettre**, sans jamais se relire mutuellement, puis je vérifie si leur assemblage tient : forme de données partagée, propriétaire unique de l'écriture, chemin de mutation cohérent, gestion d'erreur homogène, absence de race condition, autorisation systématique.

Verdict global : **le spine tient sur l'essentiel (couches, stack, session) mais laisse quatre trous concrets où deux implémentations "conformes" divergeraient silencieusement** — le plus sérieux touche exactement l'endroit que l'AD-4 désigne lui-même comme risqué (autorisation en code plutôt qu'en RLS). Un trou est une contradiction interne du spine lui-même (le modèle de données), pas seulement un risque d'interprétation.

---

## Trou 1 (HIGH) — Autorisation organisateur non mutualisée entre Server Actions (AD-4)

**Construction adversariale.** Basile construit `app/organisateurs/actions.ts` avec deux Server Actions colocalisées, toutes deux conformes à AD-3 (Server Action, pas de route API) et à AD-4 ("l'autorisation... est vérifiée en code dans la Server Action") :

- `repondre(conversationId, body)` — FR-6. Basile, conscient que c'est la fonctionnalité "sensible", ouvre la fonction par `const user = await getOrganisateur(); if (!user) return { error: 'non authentifié' }`.
- `marquerLu(conversationId)` — appelée automatiquement par un `useEffect` côté client quand l'organisateur ouvre `[conversationId]/page.tsx` (mentionnée dans l'arborescence du spine : "répondre, marquer lu"). Perçue comme une action à faible enjeu ("juste un accusé de lecture interne"), elle est écrite vite, sans le même garde-fou, sous l'hypothèse implicite "on n'arrive sur cette page que si on est déjà connecté".

**Pourquoi ça casse.** Une Server Action Next.js est un endpoint POST adressable indépendamment du rendu de la page qui l'a déclenchée. AD-4 ne pose qu'une règle par table (`conversations`/`messages` : pas de client Supabase direct), pas une règle "chaque Server Action doit ré-vérifier l'authentification elle-même, y compris les actions à faible enjeu perçu". Rien dans le spine n'interdit à Basile d'omettre le contrôle dans `marquerLu` — il n'a violé aucun AD. Résultat : un tiers qui devine ou observe un `conversationId` (pas explicitly listé comme secret nulle part dans le spine, contrairement au Code de récupération) peut appeler `marquerLu` sans être authentifié, et — si `marquerLu` est aussi le mécanisme qui neutralise la relance FR-15 (voir Trou 2) — supprimer silencieusement la notification de relance sur une Conversation à Signal de danger.

**Fixe proportionné.** Une phrase ajoutée à AD-4 : *"Chaque Server Action sous `app/organisateurs/` vérifie elle-même la session Supabase Auth en première ligne, y compris les actions perçues comme mineures (marquer lu, etc.) — jamais une hypothèse implicite que la page appelante l'a déjà fait."* Ne mérite pas un AD dédié.

---

## Trou 2 (HIGH) — État "lu / non lu" référencé par deux fonctionnalités, absent du modèle de données

**Constat.** Le modèle de données (section "Modèle de données") ne contient **aucun champ** de type lu/non-lu ni sur `CONVERSATION` ni sur `MESSAGE`. Pourtant :
- l'arborescence source liste explicitement une Server Action **"marquer lu"** dans `app/organisateurs/actions.ts` (gouverne FR-6) ;
- AD-7 dit que la relance FR-15 se déclenche "si aucun organisateur n'a ouvert la Conversation sous 4h" ;
- la Structural Seed dit que le cron "vérifie messages prioritaires non lus".

Trois références à une notion de lecture, zéro colonne pour la porter.

**Construction adversariale.** Basile (organisateur) et Charles (élève/cron), chacun conforme au spine puisque celui-ci ne tranche rien :
- Basile ajoute une colonne `conversations.read_at timestamptz nullable`, mise à `now()` par `marquerLu`.
- Charles, en implémentant `envoyerMessage` (FR-1, côté élève), ne sait pas que ce champ existe (il n'est dans aucun AD ni dans le modèle de données officiel) et ne le remet donc jamais à `NULL` quand un nouveau message élève arrive après une lecture.
- Le cron FR-15, écrit par l'un ou l'autre en s'appuyant sur `read_at IS NULL`, considère alors comme "lue" une conversation où l'élève a répondu il y a 10 minutes après que l'organisateur l'a consultée il y a 3h — la relance de FR-15 ne se déclenche jamais alors qu'un message prioritaire attend.

L'alternative — dériver "non lu" de l'ordre des messages (`dernier message a sender_type = 'eleve' ET aucun message organisateur après`) plutôt que d'un champ stocké — est tout aussi conforme au spine et donne un résultat différent en cas d'implémentation mixte (un dev stocke, l'autre dérive).

**Fixe proportionné.** Ajouter au modèle de données un champ explicite, par ex. `conversations.last_read_at timestamptz nullable`, **et** une phrase dans AD-4 ou dans les Consistency Conventions précisant qui l'écrit et quand il est remis à zéro : *"`last_read_at` est mis à `NULL` par la Server Action d'envoi de message élève dès qu'un nouveau message élève est inséré ; il est mis à `now()` uniquement par l'action organisateur de lecture."* Deux lignes, pas un nouvel AD.

---

## Trou 3 (MED) — Contradiction interne entre le diagramme ER et l'attribut de `RECOVERY_ATTEMPT`

**Constat.** Le diagramme Mermaid déclare `CONVERSATION ||--o{ RECOVERY_ATTEMPT : "tentatives de code"` — une relation de clé étrangère. Mais le bloc d'attributs de `RECOVERY_ATTEMPT` liste seulement `id, ip, success, created_at` : **pas de `conversation_id`**. AD-9 confirme le texte "compté... par IP", cohérent avec l'absence de FK, mais alors la relation dessinée dans le diagramme est fausse ou trompeuse.

**Construction adversariale.** Deux développeurs qui écrivent chacun une migration/action de vérification de Code à des moments différents (ou l'un après l'autre sans se relire) peuvent légitimement partir de deux lectures différentes du même spine :
- Lecture A (suit le diagramme ER) : ajoute `conversation_id uuid FK` à `recovery_attempts`, verrouille par IP **et** par conversation.
- Lecture B (suit le texte d'AD-9 à la lettre) : table strictement `id, ip, success, created_at`, verrouillage global par IP tous comptes confondus.

Si `verifierCode` (Lecture B, sans FK) est déployé en premier, puis qu'une évolution ultérieure (dashboard organisateur "voir les tentatives sur cette conversation", ou durcissement de la politique de verrouillage) est construite en supposant la FK du diagramme, elle échoue silencieusement ou nécessite une migration de rattrapage.

**Fixe proportionné.** Corriger le diagramme ER pour qu'il colle au texte d'AD-9 : soit retirer la flèche `CONVERSATION ||--o{ RECOVERY_ATTEMPT`, soit (mieux, si un verrouillage par conversation est réellement souhaité) ajouter `conversation_id` à la liste d'attributs et une clause dans AD-9. Correction du diagramme uniquement, un des deux, pas les deux à la fois.

---

## Trou 4 (LOW) — Contrat de hachage du Code de récupération non fixé

**Constat.** AD-5 dit seulement "haché (jamais stocké en clair)". Aucun algorithme, aucune bibliothèque, aucune politique de sel n'est fixé dans les Consistency Conventions ni dans `lib/session.ts`.

**Construction adversariale.** Si `creerCode` (FR-17) et `verifierCode` (FR-18) sont écrits à des moments différents — même par le même développeur, à plus forte raison par deux — sans relire l'implémentation existante, rien dans le spine n'empêche l'un d'utiliser `bcrypt` et l'autre `sha256(code + pepper)`. Le risque est atténué par le fait que la Capability Map colocalise les deux dans le même fichier (`app/discussion-anonyme/actions.ts`), donc probablement le même développeur — mais rien ne l'impose, et si le fichier est un jour scindé (ce que rien n'interdit), le risque redevient réel.

**Fixe proportionné.** Une ligne dans les Consistency Conventions : *"Le Code de récupération est haché via [algorithme choisi, ex. bcrypt via une seule fonction exportée de `lib/session.ts`] — jamais réimplémenté ailleurs."*

---

## Trou 5 (LOW) — Nullabilité de `session_token_hash` non spécifiée pour le mode éphémère

**Constat.** `recovery_code_hash` est explicitement annoté "nullable, absent si éphémère" dans le modèle de données. `session_token_hash` ne porte aucune annotation, alors qu'AD-5 dit du mode éphémère (FR-19) : "ni cookie, ni code, ni `session_token` persistant."

**Construction adversariale.** Un développeur qui implémente la création de Conversation (FR-16, choix de mode) peut soit (a) ne jamais générer de `session_token` pour une Conversation éphémère → colonne `NULL`, soit (b) en générer un quand même en base pour satisfaire une contrainte `NOT NULL` implicite, simplement sans jamais le poser en cookie côté client. Les deux sont conformes au texte d'AD-5 ("l'élève n'a aucun moyen d'y revenir" reste vrai dans les deux cas), mais donnent une forme de donnée différente. Une fonctionnalité future qui interroge `WHERE session_token_hash = ...` pour, par exemple, détecter des tokens dupliqués ou faire une purge (cf. Deferred "durée de conservation") se comporte différemment selon laquelle des deux implémentations a été retenue.

**Fixe proportionné.** Ajouter "nullable, absent si éphémère" à `session_token_hash` dans le modèle de données, en miroir de `recovery_code_hash` — cohérence de deux mots, pas plus.

---

## Note (pas un trou) — `flagged_missed_danger` orphelin de la Capability Map

Le champ existe dans le modèle de données (SM-2bis) mais n'apparaît dans aucune ligne de la Capability → Architecture Map ni dans l'arborescence source (`app/organisateurs/actions.ts` ne liste que "répondre, marquer lu"). Ce n'est pas une incompatibilité entre deux implémentations puisque personne n'a encore de mandat pour l'écrire — mais c'est le genre de champ qu'un développeur ajoutera un jour comme case à cocher dans `repondre()`, pendant que l'autre s'attend à une action séparée `signalerDangerManque()`. À trancher au moment où FR/SM-2bis sera implémenté, pas maintenant ; mentionné ici pour mémoire.

---

## Ce qui tient bien (pas de trou trouvé)

- **AD-3** (Server Actions uniquement) : aucune paire plausible de contournement trouvée — la seule sortie HTTP (Telegram) est explicitement exemptée et unidirectionnelle, pas de surface pour un dev d'introduire une route API concurrente sans le faire consciemment contre le texte.
- **AD-6** (mots-clés, avant écriture) : l'ordre "détection avant écriture, avant accusé de réception" est assez précis pour qu'une Server Action `envoyerMessage` écrite par n'importe qui produise le même comportement observable ; pas de fenêtre de race trouvée à l'intérieur d'un seul appel.
- **AD-8 / AD-2 / AD-10** : périmètre trop fermé (deux comptes provisionnés à la main, stack verrouillée, un seul environnement) pour laisser un point de divergence entre deux devs — rien à attaquer ici à ce niveau de granularité.
