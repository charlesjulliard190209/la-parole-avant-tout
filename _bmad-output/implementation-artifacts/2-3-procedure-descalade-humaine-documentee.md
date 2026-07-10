---
baseline_commit: f1b350c63acfefeef51948cb9b73f0945fd23af7
---

# Story 2.3: Procédure d'escalade humaine documentée

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a organisateurs (Charles et Basile),
I want une procédure écrite claire pour savoir quand et comment alerter la CPE/counsellor après un Signal de danger,
so that je sais exactement quoi faire et comment prendre soin de moi-même après, sans devoir improviser dans un moment stressant.

## ⚠️ Nature particulière de cette story

Contrairement à toutes les stories précédentes (1.1 à 2.2), **cette story ne produit aucun code**. FR-11 le dit explicitement : *"cette procédure est un document/checklist externe au produit logiciel (pas une fonctionnalité du chat)"* [Source: prd.md#FR-11]. Le livrable est un unique fichier Markdown dans `docs/`, hors de `app/`/`lib/`/`supabase/` — aucune Server Action, aucune page, aucune migration. Il n'apparaît d'ailleurs pas dans la Capability → Architecture Map (qui couvre FR-1 à FR-19 sauf FR-11) : c'est cohérent, pas un oubli de l'Architecture.

**Contrainte de sécurité non négociable** : ce document sera réellement utilisé par des lycéens mineurs (Charles, Basile) dans un moment de crise réelle. N'invente **jamais** un nom, un numéro de téléphone, ou une personne de contact qui n'existe pas dans les artefacts de planification. Là où l'information réelle manque (coordonnées CPE/counsellor, contact de debrief), le document doit contenir un espace réservé explicite et impossible à manquer (ex. `[À COMPLÉTER PAR CHARLES — ...]`), jamais une valeur plausible inventée pour "faire complet". Une fausse coordonnée dans ce document précis serait pire qu'un vide visible.

## Acceptance Criteria

1. Given un Signal de danger est détecté (Story 2.2, `is_priority = true`) et qu'un Organisateur doit juger si ça justifie d'appeler la CPE/counsellor, When il consulte `docs/procedure-escalade-cpe-counsellor.md`, Then il y trouve des critères de gravité concrets qui distinguent "j'appelle la CPE" de "je réponds humainement dans la conversation sans escalader" — pas seulement la formule vague "en cas de danger sérieux". [Source: epics.md#Story-2.3 AC#1; prd.md#FR-11 conséquences testables]
2. Given qu'il doit joindre la CPE/counsellor, Then le document prévoit un emplacement dédié à ses coordonnées à jour (nom, téléphone, disponibilité connue) — rempli par un espace réservé explicite, car **aucune coordonnée réelle n'existe dans les artefacts de planification** (l'accord CPE est oral à ce jour, cf. PRD §8). Ne jamais inventer une coordonnée plausible. [Source: prd.md#FR-11 "Notes", §8 Prérequis avant lancement public; epics.md#Story-2.3 AC#1]
3. Given qu'il passe l'appel, Then le document précise noir sur blanc ce qui peut/doit être dit — **jamais l'identité de l'Élève**, que les Organisateurs ne connaissent de toute façon pas eux-mêmes — et documente explicitement que l'appel prévient la CPE qu'**un Organisateur a jugé la situation préoccupante** (jugement éclairé notamment par la détection automatique de mots-clés, FR-9, jamais un déclenchement automatique), et non qu'un contact direct de l'Élève serait possible (`[DÉCISION 2026-07-10]` — le produit ne donne à l'Élève aucun moyen d'obtenir les coordonnées de la CPE). Ce n'est **pas** un signalement identifié permettant une intervention physique immédiate. Ne pas euphémiser cette limite ni laisser croire que l'appel "règle" la situation. [Source: prd.md#4.6 Protocole d'escalade humaine (mis à jour 2026-07-10); review-adversarial-crisis.md Finding 1; décision de Charles 2026-07-10]
4. Given qu'un signalement grave affecte aussi l'Organisateur lui-même (lycéen mineur qui vient de lire un message de détresse, parfois seul, tard le soir), Then le document désigne un espace pour un point de contact de debrief que l'Organisateur peut solliciter après coup pour lui-même — même traitement qu'AC#2 si ce contact n'est pas encore désigné : espace réservé explicite, jamais une invention. [Source: epics.md#Story-2.3 AC#1 "point de contact... debrief"; prd.md#FR-11 conséquences testables; review-adversarial-crisis.md Finding 4]
5. Given que ce livrable est un document de procédure et non une fonctionnalité du produit, Then il vit dans `docs/procedure-escalade-cpe-counsellor.md` — aucun fichier sous `app/`, `lib/`, ou `supabase/migrations/` n'est créé ou modifié par cette story. [Source: prd.md#FR-11 "hors du système, ex. document de référence"; epics.md#Story-2.3 "ce document est externe au produit logiciel"]
6. Given que la confirmation écrite de l'accord CPE/counsellor est un prérequis bloquant de lancement public **distinct** de cette story (PRD §8), Then le document produit ici porte, en tête, un marqueur de statut visible ("ébauche non confirmée — accord CPE oral uniquement à ce jour, ne pas confondre avec le prérequis de lancement public") pour qu'il ne soit jamais lu comme si ce prérequis était déjà rempli. [Source: prd.md#8 Prérequis avant lancement public; epics.md#Story-2.3 "prête pour construire ; sa confirmation formelle est un prérequis de lancement public distinct"]

## Tasks / Subtasks

- [x] Task 1: Créer `docs/procedure-escalade-cpe-counsellor.md` (AC: #1, #2, #3, #4, #5, #6)
  - [x] Créer le dossier `docs/` (n'existe pas encore dans ce dépôt — `project_knowledge` du config BMad le désigne comme réceptacle, mais aucun fichier n'y vit à ce jour).
  - [x] En-tête de statut (AC #6) : encadré visible en haut du document, formulation proche de "🚧 Ébauche non confirmée — l'accord de la CPE/counsellor est aujourd'hui **oral uniquement**. Ne pas présenter ce document comme preuve que le prérequis de lancement public 'accord confirmé par écrit' (PRD §8) est rempli."
  - [x] Section "Quand appeler" (AC #1) : critères de gravité concrets, ex. idées suicidaires explicites ou plan concret évoqué, automutilation active décrite, tout autre message qui inquiète sérieusement l'Organisateur même sans mot-clé détecté par `lib/danger-keywords.ts` (cohérent avec le cas limite UJ-4 du PRD : un vrai danger peut échapper aux mots-clés, la lecture humaine reste la ligne de défense). Marquer explicitement cette liste comme point de départ à valider avec Charles avant lancement public — même traitement que `DANGER_KEYWORDS` en Story 2.2 (livré non validé cliniquement, signalé comme point ouvert), pas une liste figée présentée comme validée.
  - [x] Section "Qui appeler" (AC #2) : emplacement pour nom, téléphone, plage de disponibilité connue de la CPE/counsellor — contenu : espace réservé explicite type `[À COMPLÉTER PAR CHARLES — coordonnées CPE/counsellor]`, jamais une valeur inventée.
  - [x] Section "Que dire / ne jamais dire" (AC #3) : script court à suivre à l'appel. Doit inclure explicitement : (a) ne jamais donner ni tenter de deviner l'identité de l'Élève ; (b) formuler l'objet de l'appel comme "prévenir que l'Élève pourrait appeler directement", pas "signaler un cas identifié" ; (c) une phrase honnête sur la limite de cet appel (il ne permet pas d'intervention physique immédiate tant que l'Élève ne se dévoile pas lui-même) — reprendre l'esprit de PRD §4.6 sans l'édulcorer.
  - [x] Section "Après l'appel — prendre soin de vous" (AC #4) : reconnaît explicitement que lire un message de détresse et faire cet appel peut être lourd pour un lycéen mineur ; emplacement pour un contact de debrief (adulte de confiance, parent, etc.) — même règle "espace réservé, jamais inventé" qu'AC #2.
  - [x] Section "Ce que ce document n'est pas" : rappelle qu'il ne remplace ni la confirmation écrite de l'accord CPE (PRD §8) ni une clarification du statut légal du projet — ce sont des prérequis de lancement public distincts, non résolus par cette story.
  - [x] Ton et longueur : document court et actionnable (checklist/aide-mémoire), pas une prose longue — c'est un outil à consulter en situation de stress, pas un rapport à lire au calme.

- [x] Task 2: Vérification manuelle (AC: #1 à #6)
  - [x] Relire le document en entier et confirmer qu'aucune coordonnée, nom, ou numéro de téléphone n'a été inventé — seuls des espaces réservés explicites apparaissent partout où une information réelle manque. (Vérifié par grep : seuls les 2 marqueurs `[À COMPLÉTER PAR CHARLES...]` apparaissent ; aucun numéro/nom fabriqué ailleurs dans le fichier.)
  - [x] Confirmer qu'aucun fichier sous `app/`, `lib/`, ou `supabase/` n'a été créé ou modifié (`git status` doit ne montrer que l'ajout de `docs/procedure-escalade-cpe-counsellor.md`). (Vérifié : seuls `docs/procedure-escalade-cpe-counsellor.md` et les artefacts BMad — story file + sprint-status.yaml — apparaissent dans `git status`.)
  - [x] Faire relire le document par Charles avant de le marquer `done` — Charles a donné son accord pour passer directement en `review` (2026-07-10), sans demande de changement de contenu à ce stade.
  - [x] Signaler explicitement à Charles, à la fin de cette story, que les espaces réservés (coordonnées CPE/counsellor, contact de debrief) restent à compléter par lui — signalé dans le message précédent et repris dans les Completion Notes ci-dessous ; ce n'est pas une omission de la story mais une information que seul Charles possède.

### Review Findings

- [x] [Review][Decision] Le script d'appel présuppose que l'Élève pourrait contacter la CPE "directement" — prémisse héritée d'un FR-10 obsolète [docs/procedure-escalade-cpe-counsellor.md:33] — **Résolu (2026-07-10)** : Charles tranche que c'est l'Organisateur qui juge, à la lecture d'un message (éclairé notamment par la détection automatique de mots-clés, FR-9, jamais un déclenchement automatique), que la situation justifie l'appel. Le script a été reformulé pour prévenir la CPE qu'un Organisateur a jugé une situation préoccupante, et non qu'un contact direct de l'Élève serait possible. PRD §4.6 et le Glossaire ("Protocole d'escalade") ont été corrigés en conséquence pour refléter cette même décision.
- [x] [Review][Patch] "Qui appeler" invente un canal de repli non vérifié [docs/procedure-escalade-cpe-counsellor.md:33] — Corrigé : la phrase affirme désormais explicitement qu'aucun canal d'escalade vérifié n'existe tant que l'encart n'est pas complété, et que le "standard du lycée" n'est qu'un pis-aller non confirmé — plus une hypothèse présentée comme fiable.
- [x] [Review][Patch] Aucune consigne d'informer/consulter l'autre Organisateur avant ou pendant l'appel [docs/procedure-escalade-cpe-counsellor.md:38] — Corrigé : nouvelle puce explicite demandant d'informer l'autre Organisateur avant/pendant l'appel si possible, sinon dès que possible après, avec référence à FR-10 (double notification).
- [x] [Review][Patch] Aucune consigne si la CPE demande plus de détails ou veut elle-même escalader [docs/procedure-escalade-cpe-counsellor.md:42] — Corrigé : nouvelle puce couvrant ce cas (répondre honnêtement qu'il n'y a rien de plus à donner, noter la demande pour un debrief, ne jamais improviser).
- [x] [Review][Patch] Les critères "Quand appeler" se lisent comme un binaire absolu [docs/procedure-escalade-cpe-counsellor.md:18-20] — Corrigé : ajout d'un critère explicite pour une menace physique crédible même sans mot-clé, et d'une phrase "en cas de doute, appelez" pour éviter la lecture "le harcèlement n'escalade jamais".
- [x] [Review][Patch] Aucune consigne si l'Élève a lui-même révélé des détails identifiants dans son message [docs/procedure-escalade-cpe-counsellor.md:41] — Corrigé : nouvelle puce couvrant ce cas (ne transmettre ces détails que si strictement nécessaire à la sécurité immédiate, jamais par réflexe).
- [x] [Review][Patch] Aucune consigne de consigner (métadonnées seulement) qu'un appel a eu lieu [docs/procedure-escalade-cpe-counsellor.md:44] — Corrigé : ajout d'une consigne de noter date/heure de l'appel entre les deux Organisateurs (jamais le contenu du message), cohérent avec la discipline de logs du produit.
- [x] [Review][Patch] Exemple de phrase de debrief trop spécifique dans le temps [docs/procedure-escalade-cpe-counsellor.md:52] — Corrigé : la mention "ce soir" a été retirée, avec un avertissement explicite d'éviter de préciser le moment ou des détails permettant de recouper la conversation.
- [x] [Review][Patch] Espaces réservés peu visibles visuellement [docs/procedure-escalade-cpe-counsellor.md:31,53] — Corrigé : les deux espaces réservés sont désormais des blocs de citation avec un marqueur 🔲 en tête, au même niveau de visibilité que le bandeau de statut, plutôt qu'un simple span de code inline.
- [x] [Review][Patch] Aucun marqueur de date de dernière révision sur le document lui-même [docs/procedure-escalade-cpe-counsellor.md:5] — Corrigé : ligne "Dernière révision : 2026-07-10" ajoutée dans le bandeau de statut en tête.
- [x] [Review][Patch] Aucune note sur une copie accessible hors-ligne [docs/procedure-escalade-cpe-counsellor.md:9] — Corrigé : phrase ajoutée recommandant une copie accessible hors ligne (photo, impression).
- [x] [Review][Patch] Aucune consigne sur un nouveau message alarmant après un appel déjà passé [docs/procedure-escalade-cpe-counsellor.md:22] — Corrigé : phrase ajoutée précisant qu'un nouveau signal qui aggrave ou répète justifie un nouvel appel.
- [x] [Review][Defer] Signal de danger concernant un tiers (pas l'Élève lui-même) non couvert [docs/procedure-escalade-cpe-counsellor.md:14-18] — deferred, pre-existing : FR-9 définit le Signal de danger uniquement autour des idées suicidaires/de l'automutilation de l'Élève lui-même (pas d'un danger décrit venant d'un tiers) — une extension de périmètre à trancher au niveau produit (FR-9), pas dans cette story sur la procédure d'escalade.
- [x] [Review][Defer] Aucune boucle de confirmation/clôture avec la CPE après l'appel [docs/procedure-escalade-cpe-counsellor.md:28-35] — deferred, pre-existing : orthogonal au cœur des AC de cette story (informer la CPE), question de process plus large non bloquante pour l'usage immédiat de la procédure.

## Dev Notes

- **Ce qui rend cette story différente de toutes les précédentes** : aucune des conventions de code du dépôt (Server Actions, `lib/`, migrations, `npm run lint`/`build`, vérification par script Node contre Supabase) ne s'applique ici. Ne pas chercher à "coder" cette story — Task 1 est un exercice de rédaction, Task 2 une relecture humaine, pas une vérification technique.
- **FR-11 et sa limite déjà actée par le PRD lui-même** : *"Les Organisateurs disposent d'une procédure claire et écrite (hors du système, ex. document de référence)... `[ASSUMPTION]` cette procédure est un document/checklist externe au produit logiciel (pas une fonctionnalité du chat)."* [Source: prd.md#FR-11]. epics.md confirme : *"ce document est externe au produit logiciel, pas une fonctionnalité du chat."* Ne pas construire d'écran organisateur ni de champ en base pour cette procédure.
- **La faille structurelle que ce document doit documenter honnêtement, pas cacher** : la revue adversariale du PRD (Finding 1, sévérité CRITIQUE) montre qu'une escalade "vers la CPE" est en pratique très limitée puisque le produit interdit toute identité (FR-1, Non-Goals §5) — *"l'Organisateur voit la conversation marquée prioritaire — et n'a aucun moyen de dire à la CPE de qui il s'agit... L'escalade se réduit alors à : appeler la CPE pour dire 'un élève anonyme a écrit quelque chose d'inquiétant, je ne sais pas qui'."* Cette story doit refléter cette limite dans le script d'appel (AC #3), pas la présenter comme une "vraie" intervention identifiée. [Source: review-adversarial-crisis.md Finding 1]
- **`[DÉCISION 2026-07-10, résolue en code-review]` Qui déclenche l'appel, et pourquoi** : PRD §4.6 disait auparavant que l'appel visait à "prévenir la CPE/counsellor qu'un appel direct de l'Élève est possible (sa ligne étant affichée parmi les Numéros d'urgence, FR-10)" — une prémisse devenue obsolète depuis que FR-10 a été révisé le 2026-07-10 (l'Élève ne voit plus jamais aucun numéro d'urgence, FR-8 retiré) sans que le PRD §4.6 lui-même ait été mis à jour à ce moment-là. Charles a tranché pendant la revue de code de cette story : **c'est l'Organisateur qui juge**, à la lecture d'un message, que la situation justifie l'appel — un jugement éclairé notamment par la détection automatique de mots-clés à risque (FR-9), mais jamais un déclenchement automatique du produit lui-même. L'appel prévient donc la CPE qu'un Organisateur a jugé une situation préoccupante, **pas** qu'un contact direct de l'Élève serait possible. PRD §4.6 et le Glossaire ("Protocole d'escalade") ont été corrigés en conséquence dans le même passage de revue. [Source: décision de Charles, 2026-07-10; prd.md#4.6, prd.md#3 Glossaire]
- **Le statut oral de l'accord CPE est un fait déjà connu du PRD, pas une découverte de cette story** : PRD §8 (Prérequis avant lancement public) : *"Accord CPE/counsellor confirmé par écrit... actuellement un accord oral seulement."* La revue adversariale (Finding 3) prévient explicitement contre le risque de traiter "Procédure d'escalade documentée" comme si elle rendait ce prérequis rempli — d'où AC #6 et l'en-tête de statut de Task 1. Ne pas supprimer ni adoucir cet avertissement pour "faire plus fini".
- **Charge mentale des Organisateurs eux-mêmes, pas seulement protocole envers la CPE** : la revue adversariale (Finding 4) note qu'aucun garde-fou n'existe pour un lycéen mineur qui lit seul un message de détresse grave, potentiellement tard le soir, sans ressource de soutien pour lui-même. epics.md#Story-2.3 AC#1 demande explicitement *"un point de contact que les Organisateurs peuvent eux-mêmes solliciter pour un debrief"* — c'est la section "Après l'appel" de Task 1, pas un à-côté optionnel.
- **Précédent direct dans ce dépôt pour "livrer un point de départ non validé, signalé comme tel"** : Story 2.2 (`lib/danger-keywords.ts`) a livré une liste de mots-clés de danger qualifiée d'hypothèse non validée cliniquement, explicitement signalée à Charles comme point ouvert avant lancement public. Les "critères de gravité" de cette story (Task 1) suivent exactement le même principe : un point de départ raisonnable, jamais présenté comme validé par un professionnel. [Source: 2-2-detection-automatique-de-signal-de-danger-et-affichage-immediat-des-numeros.md, Completion Notes]
- **Cohérence avec la décision du 2026-07-10 (retrait FR-8)** : ce document est un outil interne aux Organisateurs, jamais montré à l'Élève, jamais lié à l'interface produit — cohérent avec la décision de Charles que l'Élève ne doit voir aucun numéro d'urgence nulle part dans le produit. Les numéros nationaux (Samaritans, Childline) mentionnés dans l'addendum du PRD restent, eux aussi, un aide-mémoire interne possible pour les Organisateurs (PRD FR-10, conséquences testables : *"C'est dans l'interface Organisateurs, jamais dans l'interface Élève, que la CPE/counsellor et les numéros nationaux... peuvent être référencés"*) — mais cette story ne construit aucune interface, donc ces numéros, s'ils sont inclus dans le document, sont eux aussi des données à traiter avec la même prudence qu'AC #2 (cf. addendum : *"liste exacte à confirmer/valider, ne pas la considérer figée depuis cette recherche"*).
- **Pas de nouvelle dépendance, pas de framework de test** : sans objet pour cette story (aucun code).

### Project Structure Notes

Fichier à créer :
- `docs/procedure-escalade-cpe-counsellor.md` — seul livrable de cette story (Task 1). Le dossier `docs/` n'existe pas encore dans le dépôt ; le config BMad (`_bmad/bmm/config.yaml`, `project_knowledge`) le désigne déjà comme réceptacle de connaissance projet hors artefacts de planification/implémentation — emplacement cohérent, pas une convention nouvelle inventée pour cette story.

Fichiers explicitement **non créés/non modifiés**, à ne pas anticiper :
- Tout fichier sous `app/`, `lib/`, `supabase/migrations/` — cette story n'ajoute aucune fonctionnalité au produit logiciel (AC #5).
- Aucune modification de `lib/danger-keywords.ts` (Story 2.2, déjà `done`) — cette story ne touche pas aux critères de *détection automatique*, seulement à la procédure *humaine* qui suit une détection déjà marquée prioritaire.

Aucune variance par rapport à l'Architecture : FR-11 n'apparaît pas dans la Capability → Architecture Map (ARCHITECTURE-SPINE.md) — confirmé volontaire, pas un oubli, puisque FR-11 est explicitement hors du système logiciel.

### References

- [Source: epics.md#Epic-2, Story-2.3] — story source, AC épics
- [Source: prd.md#FR-11 (§4.6)] — procédure hors-système, contenu minimal requis (critères, coordonnées, script d'appel, contact debrief)
- [Source: prd.md#4.6 Protocole d'escalade humaine] — objectif précis et limité de l'appel CPE (prévenir, pas transmettre un dossier identifié)
- [Source: prd.md#8 Questions ouvertes / Prérequis avant lancement public] — statut oral de l'accord CPE, confirmation écrite = prérequis bloquant distinct
- [Source: prd.md#5 Non-Goals; FR-1] — anonymat total, aucune identité collectée (fondement de la limite structurelle de l'escalade)
- [Source: review-adversarial-crisis.md, Finding 1] — escalade CPE structurellement limitée sans identité, à documenter honnêtement
- [Source: review-adversarial-crisis.md, Finding 3] — ne pas traiter cette story comme remplissant le prérequis de confirmation écrite
- [Source: review-adversarial-crisis.md, Finding 4] — charge mentale des Organisateurs-mineurs, besoin d'un contact de debrief
- [Source: review-adversarial-crisis.md, Finding 8] — liste de numéros d'urgence non validée, même prudence à appliquer aux coordonnées CPE
- [Source: addendum.md] — numéros UK cités (Samaritans 116 123, Childline 0800 1111, 999/111) explicitement non figés
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — FR-11 absent de la map, cohérent avec son statut hors-système
- [Source: 2-2-detection-automatique-de-signal-de-danger-et-affichage-immediat-des-numeros.md] — précédent de livraison d'un point de départ non validé, signalé comme point ouvert
- [Source: _bmad/bmm/config.yaml, project_knowledge] — `docs/` comme réceptacle de connaissance projet

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- Aucun outil de test/lint applicable (story sans code, cf. "Nature particulière de cette story"). Vérifications effectuées : `git status --porcelain` (confirme qu'aucun fichier sous `app/`, `lib/`, `supabase/` n'est touché — uniquement `docs/procedure-escalade-cpe-counsellor.md` et les artefacts BMad) ; `grep` sur les numéros/coordonnées potentiellement inventés (`À COMPLÉTER`, "samaritan", "childline", "116 123", "0800", "999", "111") confirmant que seuls les 2 espaces réservés explicites apparaissent, aucune coordonnée fabriquée.

### Completion Notes List

- `docs/procedure-escalade-cpe-counsellor.md` créé avec les 6 sections attendues (statut, quand appeler, qui appeler, que dire/ne jamais dire, après l'appel, ce que ce document n'est pas). Les 6 AC sont satisfaits par construction : #1 (critères de gravité concrets), #2 et #4 (espaces réservés explicites, aucune coordonnée inventée), #3 (script d'appel qui documente honnêtement la limite structurelle de l'escalade sans identité), #5 (aucun fichier produit touché), #6 (bandeau de statut en tête).
- **Point ouvert à trancher par Charles avant `done`** : le contenu (critères de gravité, ton du script d'appel) reflète mon interprétation des artefacts de planification (PRD, addendum, revue adversariale) — pas un avis professionnel. La Task 2 de la story prévoit explicitement une relecture par Charles avant de considérer la story terminée ; je ne peux pas me substituer à ce jugement humain sur un document de crise réel.
- **Espaces réservés à compléter par Charles** (information que je ne peux pas connaître) : coordonnées CPE/counsellor (nom, téléphone, disponibilité) et contact de debrief pour les Organisateurs eux-mêmes.

### File List

- `docs/procedure-escalade-cpe-counsellor.md` (créé, puis corrigé en code-review — reformulation de l'objectif de l'appel)
- `_bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md` (corrigé en code-review — §4.6 et Glossaire "Protocole d'escalade")
- `_bmad-output/implementation-artifacts/deferred-work.md` (2 findings différés ajoutés en code-review)

## Change Log

- 2026-07-10 : Story créée (create-story) — analyse exhaustive des artefacts de planification (PRD, addendum, revue adversariale de crise, Architecture, epics.md, Story 2.2) complétée ; guide développeur complet prêt pour `dev-story`.
- 2026-07-10 : Implémentation (dev-story) — `docs/procedure-escalade-cpe-counsellor.md` créé (Task 1). Charles a relu et donné son accord pour passer directement en `review` (Task 2), sans demande de changement de contenu à ce stade — espaces réservés (coordonnées CPE/counsellor, contact de debrief) explicitement laissés en place, à compléter par Charles. Les 6 AC et les 2 Tasks sont satisfaits — passage en `review`.
- 2026-07-10 : Revue de code (code-review) — 3 réviseurs (Blind Hunter, Edge Case Hunter, Acceptance Auditor) en parallèle. 1 finding decision-needed, 11 patch, 2 deferred, 2 dismissed (faux positif + convention de citation déjà établie dans le dépôt). Decision résolue par Charles : le script d'appel promettait à tort qu'un Élève pourrait contacter la CPE "directement", une prémisse héritée d'un FR-10 devenu obsolète depuis sa révision du 2026-07-10 (l'Élève ne voit plus jamais aucun numéro d'urgence). Corrigé : c'est désormais l'Organisateur qui juge, à la lecture du message (éclairé par la détection de mots-clés, FR-9), que la situation justifie l'appel — `docs/procedure-escalade-cpe-counsellor.md` reformulé en conséquence, et `prd.md` (§4.6, Glossaire) corrigé pour rester cohérent avec cette même décision.
- 2026-07-10 : Les 11 patch findings appliqués (option "tout corriger maintenant") — canal de repli non vérifié corrigé, consultation de l'autre Organisateur ajoutée, script étoffé pour la relance CPE et les détails identifiants révélés par l'Élève, critères de gravité assouplis pour éviter la lecture binaire, logging metadata des appels, phrase de debrief désensibilisée dans le temps, espaces réservés rendus visuellement proéminents, date de dernière révision et note de copie hors-ligne ajoutées, consigne sur les signaux répétés ajoutée. Tous les findings résolus (fixed/deferred/dismissed) — passage en `done`.
