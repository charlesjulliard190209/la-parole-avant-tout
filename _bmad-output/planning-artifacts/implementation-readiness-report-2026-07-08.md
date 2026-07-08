---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/epics.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-07-08
**Project:** la-parole-contre-tous

## Document Inventory

**PRD Files Found:**
- Whole document: `_bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md`

**Architecture Files Found:**
- Whole document: `_bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md`

**Epics & Stories Files Found:**
- Whole document: `_bmad-output/planning-artifacts/epics.md`

**UX Design Files Found:**
- None found — no UX design contract exists for this project (noted during epics/stories extraction; not blocking, no UI-critical ambiguity flagged so far).

**Duplicates:** None — each document type has exactly one version, no whole+sharded conflicts.

## PRD Analysis

### Functional Requirements

FR-1: Un Élève peut écrire et envoyer un message via l'interface du chat sans créer de compte ni fournir d'identité. Aucun champ obligatoire ne demande nom/email/identifiant scolaire ; associé à une Session anonyme, jamais à une identité réelle ; fonctionne mobile et desktop.

FR-2: Un Élève revenant depuis le même navigateur/appareil retrouve automatiquement sa Conversation précédente, réponses incluses. Ne s'applique pas en mode éphémère (FR-19). Si le cookie est absent et aucun Code créé, une nouvelle Conversation vierge est créée sans erreur.

FR-3: Un Élève voit s'afficher, immédiatement après l'envoi de son message, un accusé de réception confirmant la bonne réception et indiquant un délai de réponse honnête. Affichage en moins de 2 secondes ; texte ne promettant jamais une réponse "immédiate"/"instantanée" ; généré/assisté par IA selon le PRD `[ASSUMPTION]` (résolu en architecture, AD-11 : texte pré-écrit, pas d'IA).

FR-4: Seuls les deux Organisateurs peuvent s'authentifier pour accéder à l'interface de gestion des Conversations. Aucun accès sans authentification réussie ; seuls deux comptes existent, pas de création en libre-service.

FR-5: Un Organisateur authentifié peut voir la liste des Conversations, avec un indicateur clair des messages non lus/non traités. Les Conversations avec Signal de danger (FR-9) sont visuellement prioritaires.

FR-6: Un Organisateur authentifié peut écrire et envoyer une réponse dans une Conversation. Visible par l'Élève à sa prochaine visite ; les deux Organisateurs voient les mêmes Conversations et peuvent tous deux répondre.

FR-7: Un Organisateur est notifié après qu'un Élève envoie un nouveau message, via un canal à déterminer en architecture (résolu : Telegram, AD-7). Cible : au moins un Organisateur notifié en moins de 10 minutes dans au moins 90% des cas en heures d'ouverture `[ASSUMPTION]`.

FR-8: Indépendamment de toute détection, l'interface de chat affiche en permanence un accès visible aux ressources d'urgence (numéros UK), sur chaque écran, sans clic caché.

FR-9: Le système analyse chaque message Élève à la recherche de mots-clés/expressions à risque et déclenche FR-10 systématiquement en cas de correspondance, au moment de l'envoi, avant lecture humaine. Liste révisable par les Organisateurs `[ASSUMPTION]`. Un Organisateur peut signaler rétroactivement un faux négatif.

FR-10: Dès détection (FR-9), l'Élève voit s'afficher immédiatement et de façon non-manquable les Numéros d'urgence pertinents (incluant la ligne CPE/counsellor), sans attendre de réponse humaine. La Conversation est marquée prioritaire, et la notification part vers les deux Organisateurs simultanément dans ce cas précis.

FR-11: Les Organisateurs disposent d'une procédure claire et écrite (hors du système) décrivant quand/comment alerter la CPE/counsellor face à un Signal de danger, et comment prendre soin d'eux-mêmes après un signalement difficile. `[NOTE FOR PM]` l'accord de la CPE/counsellor est aujourd'hui oral — sa confirmation écrite est un prérequis bloquant de lancement public.

FR-12: Le site met en avant le chat anonyme comme fonctionnalité centrale. Un élève atteint le chat fonctionnel en un clic maximum depuis la page d'accueil ; aucune page ne présente le chat comme "à venir".

FR-13: Le site présente, dans une section dédiée distincte du chat, des repères sur comment répondre avec respect à un camarade exclu sans se sentir obligé. Accessible depuis la navigation principale ; le chat reste ouvert à ce profil (complément, pas substitut).

FR-14: Un Élève voit le texte expliquant la règle d'anonymat et sa limite avant de pouvoir écrire son premier message de la session. Le champ de saisie n'est pas actif tant que ce texte n'a pas été affiché, ni tant que le choix de mode (FR-16) n'a pas été fait. Visible en premier écran, jamais relégué à un lien "en savoir plus".

FR-15: Un message marqué prioritaire (FR-9/FR-10) qui n'est ouvert par aucun Organisateur dans un délai plancher de 4h déclenche une relance automatique renforcée vers les deux Organisateurs simultanément, sur un canal jugé plus difficile à manquer.

FR-16: Un Élève sans Conversation en cours choisit, juste après FR-14 et avant l'activation du champ de saisie, entre "Sauvegarder ma conversation" (FR-17) et "Chat éphémère" (FR-19), présenté simplement sans jargon. Un Élève revenant via cookie ou Code ne revoit pas cet écran.

FR-17: Un Élève qui choisit de sauvegarder crée lui-même un Code (alphanumérique, 6 à 20 caractères `[ASSUMPTION]`) permettant de retrouver sa Conversation plus tard, y compris depuis un autre appareil. Refus si déjà utilisé ; avertissement que quiconque connaît le Code peut lire la Conversation.

FR-18: Un Élève peut saisir un Code précédemment créé pour retrouver sa Conversation depuis un appareil différent. Code invalide → message d'erreur générique (pas d'indication d'existence). Tentatives limitées dans le temps `[ASSUMPTION]` (résolu en architecture, AD-9 : 5 échecs/15min → verrouillage 15min par IP).

FR-19: Un Élève qui choisit "Chat éphémère" envoie son message normalement (transmis aux Organisateurs, soumis à FR-9/FR-10) mais aucun Code n'est créé et la Session anonyme par cookie n'est pas activée. L'Élève est informé qu'il ne pourra pas revenir lire une réponse.

**Total FRs: 19**

### Non-Functional Requirements

NFR-1 (PRD §11): Simplicité de maintenance — toute décision technique doit rester constructible et maintenable par une équipe de deux développeurs débutants sans accompagnement soutenu. S'applique à chaque FR.

NFR-2 (PRD §11): Disponibilité — le chat doit rester accessible en continu, même si la réponse humaine ne l'est pas.

NFR-3 (PRD §11): Résilience du filet de sécurité — FR-8 ne doit jamais dépendre de FR-9 pour fonctionner.

NFR-4 (PRD §4.5, FR-10): Faux négatifs de détection atténués par la lecture humaine systématique de chaque message — filet supplémentaire, jamais un substitut.

NFR-5 (PRD §7, SM-C1): Faux positifs à surveiller pour éviter une lassitude de l'Élève — contre-métrique : ne jamais réduire la sensibilité de détection pour réduire ce bruit.

NFR-6 (PRD §10): Accès restreint — seuls les deux Organisateurs authentifiés peuvent lire les Conversations, aucun tiers (y compris CPE/counsellor) n'a d'accès direct.

NFR-7 (PRD §10): Le Code de récupération est un secret, pas un identifiant — jamais stocké en clair, tentatives de saisie limitées.

NFR-8 (PRD §10): Anonymat total y compris en cas de danger — le produit ne lève jamais l'anonymat de son propre chef.

NFR-9 (PRD §10): Conformité UK GDPR / Data Protection Act 2018 — catégorie de données sensible (santé mentale/idées suicidaires), sécurité de stockage/accès renforcée, durée de conservation à définir (non tranchée — voir prérequis §8).

NFR-10 (PRD §10): Children's Code (Age Appropriate Design Code, ICO) applicable — à faire vérifier avant un lancement élargi.

**Total NFRs: 10**

### Additional Requirements

- **Non-Goals explicites (PRD §5)** : pas de compte/identité persistante élève ; pas de récupération de conversation sans Code ; pas de récupération de Code oublié ; pas d'accès direct CPE/counsellor au système ; pas de détection de danger par IA/ML ; pas de dépendance à une adoption officielle du lycée ; podcasts/articles hors périmètre.
- **Prérequis avant lancement public (PRD §8)**, non bloquants pour construire mais bloquants pour présenter/ouvrir au lycée : accord CPE/counsellor confirmé par écrit ; statut légal du projet clarifié (UK GDPR / Children's Code, responsable de traitement) ; capacité des deux Organisateurs mineurs validée par un adulte de confiance ; durée de conservation des Conversations définie ; liste des numéros d'urgence validée dans sa forme finale.
- **Hypothèses ouvertes indexées (PRD §9)** : plusieurs `[ASSUMPTION]` restent à valider avec Charles/Basile en cours d'implémentation (seuils FR-7/FR-15, bornes du Code FR-17, mécanisme exact anti-brute-force FR-18 — ces trois derniers points sont déjà résolus côté Architecture via AD-7, AD-5, AD-9 respectivement).

### PRD Completeness Assessment

Le PRD est marqué `status: final`, daté 2026-07-06 et mis à jour 2026-07-08. Il est thorough : chaque FR a des conséquences testables explicites, un glossaire précis, des parcours utilisateurs détaillés, une section Non-Goals claire, et une liste d'hypothèses indexée plutôt que noyée dans le texte. Les seuls points explicitement non tranchés (canal de notification, mécanisme anti-brute-force exact, bornes du Code) ont depuis été résolus par l'Architecture (AD-5, AD-7, AD-9) — cohérence à vérifier à l'étape suivante. Les prérequis de lancement public (§8) restent délibérément non résolus par le PRD lui-même (accord CPE écrit, statut légal) : ce n'est pas un défaut de complétude, c'est une frontière assumée entre ce qui bloque la construction (rien) et ce qui bloque la présentation publique (plusieurs points).

## Epic Coverage Validation

### Epic FR Coverage Extracted (from epics.md FR Coverage Map)

FR-1: Epic 1 · FR-2: Epic 1 · FR-3: Epic 1 · FR-4: Epic 3 · FR-5: Epic 3 · FR-6: Epic 3 · FR-7: Epic 3 · FR-8: Epic 2 · FR-9: Epic 2 · FR-10: Epic 2 (élève) + Epic 3 (notification organisateurs) · FR-11: Epic 2 · FR-12: Epic 4 · FR-13: Epic 4 · FR-14: Epic 1 · FR-15: Epic 3 · FR-16: Epic 1 · FR-17: Epic 1 · FR-18: Epic 1 · FR-19: Epic 1

Total FRs in epics: 19 (dont 1 volontairement partagé sur deux epics : FR-10)

### FR Coverage Analysis

| FR Number | PRD Requirement (résumé) | Epic/Story Coverage | Status |
| --- | --- | --- | --- |
| FR-1 | Envoi message anonyme | Epic 1 · Story 1.3 | ✓ Covered |
| FR-2 | Continuité par cookie | Epic 1 · Story 1.4 | ✓ Covered |
| FR-3 | Accusé de réception | Epic 1 · Story 1.3 | ✓ Covered |
| FR-4 | Authentification organisateurs | Epic 3 · Story 3.1 | ✓ Covered |
| FR-5 | Consultation des conversations | Epic 3 · Story 3.2 | ✓ Covered |
| FR-6 | Réponse à une conversation | Epic 3 · Story 3.3 | ✓ Covered |
| FR-7 | Notification quasi instantanée | Epic 3 · Story 3.4 | ✓ Covered |
| FR-8 | Bandeau permanent d'urgence | Epic 2 · Story 2.1 | ✓ Covered |
| FR-9 | Détection automatique de danger | Epic 2 · Story 2.2 | ✓ Covered |
| FR-10 | Affichage urgence + notif double organisateurs | Epic 2 · Story 2.2 (affichage élève + flag `is_priority`) **et** Epic 3 · Story 3.4 (notification Telegram double) | ✓ Covered (split délibéré, documenté dans les deux epics) |
| FR-11 | Procédure d'escalade documentée | Epic 2 · Story 2.3 | ✓ Covered |
| FR-12 | Point d'entrée clair vers le chat | Epic 4 · Story 4.1 | ✓ Covered |
| FR-13 | Contenu deuxième profil | Epic 4 · Story 4.2 | ✓ Covered |
| FR-14 | Divulgation de confidentialité | Epic 1 · Story 1.1 | ✓ Covered |
| FR-15 | Relance non-lecture 4h | Epic 3 · Story 3.5 | ✓ Covered |
| FR-16 | Choix du mode de conversation | Epic 1 · Story 1.2 | ✓ Covered |
| FR-17 | Création d'un Code | Epic 1 · Story 1.2 | ✓ Covered |
| FR-18 | Récupération via Code | Epic 1 · Story 1.5 | ✓ Covered |
| FR-19 | Mode éphémère | Epic 1 · Story 1.2 | ✓ Covered |

### Missing Requirements

Aucune. Les 19 FR du PRD ont un chemin d'implémentation traçable dans epics.md. Le seul cas particulier est FR-10, volontairement scindé entre Epic 2 et Epic 3 pour éviter qu'un epic dépende d'un epic futur (Epic 2 ne peut pas dépendre du canal Telegram construit en Epic 3) — ce choix est documenté explicitement dans les deux epics, ce n'est pas un oubli.

Aucune FR présente dans les epics mais absente du PRD (pas d'epic "orphelin").

### Coverage Statistics

- Total PRD FRs: 19
- FRs covered in epics: 19
- Coverage percentage: 100%

## UX Alignment Assessment

### UX Document Status

Not Found — aucun `*ux*.md` ni dossier shardé `*ux*/` dans `_bmad-output/planning-artifacts/`.

### Alignment Issues

Sans objet — pas de document UX à comparer.

### Warnings

⚠️ **UX implicite mais absent.** Ce produit est entièrement une interface utilisateur (chat élève + tableau de bord organisateurs), utilisée par un public potentiellement vulnérable (élèves en détresse). Le PRD et les stories contiennent des critères testables précis (ex. "affiché en premier écran", "en moins de 2 secondes", "sans jargon") mais aucune décision de conception visuelle/interaction n'est fixée : ton exact du texte de divulgation (FR-14), apparence du bandeau d'urgence (FR-8, ne doit jamais sembler anxiogène ou punitif), disposition mobile-first, hiérarchie visuelle de la liste organisateurs (FR-5).

**Ce n'est pas bloquant pour commencer à construire** — les critères d'acceptation des stories 1.1/1.2/1.3 et 2.1/2.2 sont assez précis pour qu'un développeur débutant fasse des choix simples et raisonnables sans UX spec formelle, cohérent avec NFR-1 (simplicité pour une équipe de deux). **Recommandation** : envisager une passe UX légère (`bmad-ux`) avant, ou en parallèle de, l'implémentation des stories 1.1/1.2 et 2.1/2.2 spécifiquement — ce sont les écrans où le ton (rassurant, jamais anxiogène) compte le plus pour la confiance d'un·e élève en détresse. Pas nécessaire pour Epic 3/4.

## Epic Quality Review

Revue rigoureuse des 4 epics et 15 stories contre les standards de `bmad-create-epics-and-stories` (valeur utilisateur, indépendance, absence de dépendance vers l'avant, création de tables au bon moment).

### Best Practices Compliance Checklist

| Epic | Valeur utilisateur | Indépendant (pas besoin d'un epic futur) | Stories bien dimensionnées | Pas de dépendance vers l'avant | Tables créées au bon moment | AC claires | Traçabilité FR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Epic 1 | ✓ | ✓ | ✓ | ✓ | 🟡 voir ci-dessous | ✓ | ✓ |
| Epic 2 | ✓ | ✓ (dépend d'Epic 1 seulement, en amont) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Epic 3 | ✓ | ✓ (dépend d'Epic 1+2 seulement, en amont) | ✓ | ✓ | ✓ (rien à créer) | ✓ | ✓ |
| Epic 4 | ✓ | ✓ (dépend d'Epic 1 seulement, en amont) | ✓ | ✓ | ✓ (rien à créer) | ✓ | ✓ |

Aucun epic n'est une "étape technique" déguisée (pas de "Setup Database"/"API Development" comme epic) — les 4 titres sont centrés utilisateur et chacun est livrable de façon autonome sans qu'un epic futur soit nécessaire à son fonctionnement.

### 🔴 Critical Violations

Aucune.

### 🟠 Major Issues

Aucune.

### 🟡 Minor Concerns

**1. Création des tables `Conversation`/`Message` dans Story 1.1, alors que la story elle-même (afficher le texte de divulgation) n'en a pas strictement besoin — elles ne sont réellement nécessaires qu'à partir de la Story 1.3 (premier message enregistré).**
- Impact : mineur. Ce n'est pas "toutes les tables créées d'un coup" (le cas ❌ typique) — seulement les deux tables dont Epic 1 aura de toute façon besoin dans les deux stories suivantes du même epic. C'est un compromis pragmatique du bootstrap greenfield (pas de starter template, cf. Step 1), pas une dérive vers un "Epic technique".
- Recommandation (optionnelle, à l'appréciation de Charles/Basile) : si vous préférez coller strictement au principe "une table par story qui en a besoin", déplacez la création de `Conversation`/`Message` de la Story 1.1 vers la Story 1.3. Sinon, garder tel quel est défendable pour une équipe de deux débutants qui préfère un seul passage d'installation complet (cohérent avec NFR-1, simplicité de maintenance).

**2. Le texte de la Story 2.2 mentionne explicitement l'Epic 3 ("prête à être utilisée par l'interface organisateurs, Epic 3") dans ses critères d'acceptation.**
- Impact : mineur, purement rédactionnel — ça ne crée aucune dépendance fonctionnelle réelle (la Story 2.2 est testable seule : on peut vérifier que `is_priority = true` en base sans qu'Epic 3 existe). C'est une référence informative "en avant", pas un blocage.
- Recommandation : aucune action requise ; c'est déjà correctement documenté comme un partage délibéré de FR-10 entre deux epics (voir Coverage Analysis ci-dessus), pas un oubli.

### Résumé

15 stories sur 15 respectent l'indépendance, le dimensionnement et la traçabilité attendus. Les deux points relevés sont des nuances mineures, sans impact sur la capacité à commencer le développement dans l'ordre prévu (Epic 1 → 2 → 3 → 4).

## Summary and Recommendations

### Overall Readiness Status

**READY** — le PRD, l'Architecture et les Epics/Stories sont cohérents entre eux. Aucune incohérence critique ni majeure trouvée. Le développement peut démarrer par Epic 1 dans l'ordre défini.

### Critical Issues Requiring Immediate Action

Aucune.

### Recommended Next Steps

1. Démarrer directement l'implémentation par Epic 1, Story 1.1 (`bmad-sprint-planning` puis `bmad-create-story`) — rien ne bloque ce départ.
2. Envisager, avant ou pendant les stories 1.1/1.2/2.1/2.2, une passe UX légère (`bmad-ux`) sur le ton et l'apparence des écrans de divulgation, de choix de mode, et du bandeau d'urgence — ce sont les points de contact les plus sensibles émotionnellement pour un·e élève en détresse (voir UX Alignment ci-dessus). Non bloquant, mais à ne pas remettre indéfiniment.
3. Décision optionnelle à prendre en équipe : garder la création des tables `Conversation`/`Message` dans la Story 1.1 telle quelle (pragmatique, un seul passage d'installation) ou la déplacer vers la Story 1.3 pour coller strictement au principe "une table par story qui en a besoin" (voir Epic Quality Review, point 1). Les deux choix sont défendables — aucune action n'est requise avant de commencer si vous gardez tel quel.
4. Garder en tête les prérequis de lancement public du PRD (§8 : accord CPE/counsellor écrit, statut légal UK GDPR/Children's Code) — ils ne bloquent pas la construction, seulement la présentation/ouverture au lycée. À traiter en parallèle du développement, pas après.

### Final Note

Cette évaluation a identifié 3 points d'attention (1 avertissement UX, 2 remarques mineures de qualité des epics) répartis sur 2 catégories (UX Alignment, Epic Quality Review) — aucun n'est critique. Vous pouvez avancer vers l'implémentation en l'état ; les recommandations ci-dessus sont des améliorations possibles, pas des conditions bloquantes.

---

**Assessor:** bmad-check-implementation-readiness
**Date:** 2026-07-08
