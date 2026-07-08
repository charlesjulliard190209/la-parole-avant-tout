---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md
  - _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md
---

# La Parole Avant Tout - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for La Parole Avant Tout, decomposing the requirements from the PRD and the Architecture spine into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Envoi d'un message anonyme — un Élève peut écrire et envoyer un message via l'interface du chat sans créer de compte ni fournir d'identité (aucun champ nom/email/identifiant scolaire ; associé à une Session anonyme, jamais à une identité réelle ; fonctionne mobile et desktop).

FR-2: Continuité de conversation par session navigateur — un Élève revenant depuis le même navigateur/appareil retrouve automatiquement sa Conversation précédente (réponses incluses), sans action au-delà d'ouvrir la page. Ne s'applique pas en mode éphémère (FR-19). Si le cookie est absent et aucun Code créé, une nouvelle Conversation vierge est créée sans erreur.

FR-3: Confirmation immédiate à l'envoi (accusé de réception) — un Élève voit s'afficher, en moins de 2 secondes après l'envoi, un texte confirmant la bonne réception et un délai de réponse honnête (jamais "immédiat"/"instantané").

FR-4: Authentification des organisateurs — seuls les deux Organisateurs peuvent s'authentifier pour accéder à l'interface de gestion des Conversations ; aucun accès sans authentification réussie ; pas de création de compte en libre-service.

FR-5: Consultation des conversations — un Organisateur authentifié voit la liste des Conversations avec indicateur clair des messages non lus/non traités ; les Conversations avec Signal de danger (FR-9) sont visuellement prioritaires.

FR-6: Réponse à une conversation — un Organisateur authentifié peut écrire et envoyer une réponse ; visible par l'Élève à sa prochaine visite ; les deux Organisateurs voient les mêmes Conversations et peuvent tous deux répondre.

FR-7: Notification quasi instantanée — un Organisateur est notifié après qu'un Élève envoie un nouveau message, via un canal à déterminer en architecture (résolu : Telegram, voir AD-7). Cible : au moins un Organisateur notifié en moins de 10 minutes dans au moins 90% des cas en heures d'ouverture.

FR-8: Bandeau permanent de ressources d'urgence — l'interface de chat affiche en permanence, sur chaque écran, un accès visible aux numéros d'urgence (UK), indépendamment de toute détection automatique.

FR-9: Détection automatique de Signal de danger — le système analyse chaque message élève à la recherche de mots-clés/expressions à risque (idées suicidaires, automutilation) et déclenche FR-10 systématiquement en cas de correspondance, au moment de l'envoi, avant lecture humaine. Un Organisateur peut signaler rétroactivement un faux négatif (alimente SM-2bis).

FR-10: Affichage immédiat des numéros d'urgence sur détection — dès détection (FR-9), affichage immédiat et non-manquable des numéros d'urgence incluant la ligne CPE/counsellor, sans attendre de réponse humaine ; la Conversation est marquée prioritaire (FR-5) et la notification (FR-7) part vers les deux Organisateurs simultanément.

FR-11: Procédure d'escalade documentée — les Organisateurs disposent d'une procédure claire et écrite (hors du système) décrivant quand/comment alerter la CPE/counsellor et comment prendre soin d'eux-mêmes après un signalement difficile.

FR-12: Point d'entrée clair vers le chat — le site met en avant le chat anonyme comme fonctionnalité centrale ; un élève atteint le chat fonctionnel en un clic maximum depuis la page d'accueil ; aucune page ne présente le chat comme "à venir".

FR-13: Contenu dédié au deuxième profil (camarade cherchant à bien réagir) — section dédiée, distincte du chat, accessible depuis la navigation principale, avec des repères sur comment répondre avec respect à un camarade exclu.

FR-14: Divulgation de la limite de confidentialité avant le premier message — le texte expliquant la règle d'anonymat et sa limite s'affiche en premier écran avant que le champ de saisie du premier message ne s'active, et avant le choix de mode (FR-16).

FR-15: Relance automatique en cas de non-lecture d'un message prioritaire — si aucun Organisateur n'a ouvert une Conversation signalée prioritaire dans les 4h suivant la détection, une seconde notification part vers les deux Organisateurs (tâche planifiée, Vercel Cron, voir AD-7).

FR-16: Choix du mode de conversation avant le premier message — un Élève sans Conversation en cours choisit, après FR-14 et avant activation du champ de saisie, entre "Sauvegarder ma conversation" (FR-17) et "Chat éphémère" (FR-19), présenté simplement sans jargon.

FR-17: Création d'un Code personnalisé de récupération — un Élève qui choisit de sauvegarder crée lui-même un Code (alphanumérique, 6 à 20 caractères `[ASSUMPTION]`) ; refus si déjà utilisé ; avertissement que quiconque connaît le Code peut lire la Conversation.

FR-18: Récupération d'une conversation via Code — un Élève saisit son Code pour retrouver sa Conversation depuis n'importe quel appareil ; Code invalide → message d'erreur générique (pas d'indication d'existence) ; tentatives limitées dans le temps (anti-brute-force, voir AD-9).

FR-19: Mode chat éphémère — un Élève envoie son message normalement (transmis aux Organisateurs, soumis à FR-9/FR-10) mais aucun Code n'est créé et aucun cookie de continuité n'est posé ; l'Élève est informé qu'il ne pourra pas revenir lire une réponse.

### NonFunctional Requirements

NFR-1: Simplicité de maintenance — toute décision technique doit rester constructible et maintenable par une équipe de deux développeurs débutants sans accompagnement soutenu. S'applique à chaque FR.

NFR-2: Disponibilité — le chat doit rester accessible en continu, même si la réponse humaine ne l'est pas.

NFR-3: Résilience du filet de sécurité — FR-8 (bandeau permanent) ne doit jamais dépendre de FR-9 (détection) pour fonctionner.

NFR-4: Faux négatifs de détection (FR-9) atténués par la lecture humaine systématique de chaque message — la détection automatique est un filet supplémentaire, jamais un substitut.

NFR-5: Faux positifs de détection (FR-9) à surveiller pour éviter une lassitude de l'Élève face à un bandeau d'urgence affiché à tort trop souvent (contre-métrique SM-C1 : ne jamais réduire la sensibilité pour réduire ce bruit).

NFR-6: Accès restreint aux Conversations — seuls les deux Organisateurs authentifiés peuvent lire les Conversations ; aucun tiers, y compris la CPE/counsellor, n'a d'accès direct.

NFR-7: Le Code de récupération est un secret, pas un identifiant — jamais stocké en clair (haché), l'Élève est averti à la création, et les tentatives de saisie sont limitées (anti-brute-force).

NFR-8: Anonymat total y compris en cas de danger — le produit ne lève jamais l'anonymat de son propre chef ; l'Élève en est informé avant d'écrire (FR-14).

NFR-9: Conformité UK GDPR / Data Protection Act 2018 — les messages évoquant la santé mentale/idées suicidaires sont une catégorie de données sensible, impliquant sécurité de stockage/accès renforcée et une durée de conservation définie (prérequis de lancement public, non tranché à ce stade).

NFR-10: Children's Code (Age Appropriate Design Code, ICO) — applicable à tout service numérique susceptible d'être utilisé par des mineurs ; à faire vérifier avant un lancement élargi.

### Additional Requirements

- Stack imposée et verrouillée : Next.js (App Router, TypeScript) + Supabase (Postgres + Auth) + Vercel, rien d'autre côté serveur/hébergement (AD-2).
- Un seul projet Next.js remplace entièrement le site Wix existant : vitrine (FR-12, FR-13), chat (FR-1..FR-19) et interface organisateurs (FR-4..FR-6) dans un seul déploiement Vercel (AD-1).
- Toute écriture (envoi message, choix de mode, création/vérification de Code, réponse organisateur) passe par une Server Action colocalisée ; chaque Server Action vérifie elle-même l'autorisation nécessaire, jamais supposée déjà faite par la page (AD-3).
- Le navigateur ne parle jamais directement à Supabase pour les tables conversations/messages/recovery_attempts ; clé service Supabase utilisée uniquement côté serveur ; Row Level Security activée en deny-by-default sur ces 3 tables (AD-4).
- Mécanisme de session : `session_token` aléatoire en cookie httpOnly longue durée (~12 mois) ; Code de récupération haché en bcrypt (bcryptjs), jamais stocké en clair ; mode éphémère = ni cookie, ni code, ni session_token persistant (AD-5).
- Détection de danger : liste de mots-clés versionnée dans `lib/danger-keywords.ts`, testée côté serveur dans la Server Action d'envoi, avant l'accusé de réception et avant l'écriture en base ; modification = éditer le fichier + déployer (AD-6).
- Notification : un seul bot Telegram, un `chat_id` par Organisateur (2 destinataires) ; appel HTTP sortant après écriture en base ; sur Signal de danger, appel vers les deux `chat_id` simultanément ; relance FR-15 via tâche planifiée (Vercel Cron) (AD-7).
- Authentification organisateurs : Supabase Auth email + mot de passe, exactement deux comptes provisionnés manuellement dans le dashboard Supabase, aucun flux d'inscription en libre-service (AD-8).
- Anti-brute-force sur le Code : table `recovery_attempts` (IP, hash bcrypt du Code essayé, horodatage, succès/échec), non liée à une Conversation ; verrouillage 15 minutes après 5 échecs consécutifs pour une même IP (AD-9).
- Un seul environnement de production (Vercel Hobby + projet Supabase) + previews Vercel automatiques par Pull Request ; pas d'environnement de staging séparé à maintenir (AD-10).
- Accusé de réception : texte pré-écrit choisi aléatoirement parmi plusieurs variantes validées à l'avance (dans `lib/`), pas d'appel à une IA externe (AD-11).
- Conventions transverses : ids en `uuid`, dates en `timestamptz` ; aucune PII élève stockée nulle part ; logs serveur sans contenu de message ni session_token/Code en clair (seulement métadonnées techniques) ; secrets (`SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`) en variables d'environnement Vercel, jamais commitées.
- Modèle de données : tables `Conversation`, `Message`, `RecoveryAttempt`, schéma versionné dans `supabase/migrations/`.
- Arborescence source de référence : `app/page.tsx` (vitrine), `app/camarade-exclu/page.tsx`, `app/discussion-anonyme/{page.tsx,actions.ts}`, `app/organisateurs/{connexion/page.tsx,page.tsx,[conversationId]/page.tsx,actions.ts}`, `lib/{danger-keywords.ts,session.ts,telegram.ts,supabase-server.ts}`, `supabase/migrations/`.
- Aucun starter template imposé par l'Architecture — projet Next.js standard à initialiser (bootstrap classique).
- Points reportés (Deferred, hors scope MVP mais à garder en tête) : mise en veille Supabase après 7 jours d'inactivité (délai occasionnel accepté) ; aucune sauvegarde automatique de la base sur le plan gratuit (export manuel périodique à prévoir) ; durée de conservation/politique de suppression des Conversations non tranchée ; pas d'interface d'administration de la liste de mots-clés tant que Charles et Basile restent seuls organisateurs+développeurs ; pas de canal de secours si Telegram tombe en panne ; pas d'environnement de staging séparé.

### UX Design Requirements

Aucun document de conception UX (DESIGN.md/EXPERIENCE.md ou équivalent) n'a été trouvé dans les artefacts de planification. Cette section reste vide pour le moment — les stories s'appuieront directement sur les exigences testables du PRD et sur les conventions d'interface décrites dans l'Architecture.

### FR Coverage Map

FR-1: Epic 1 - Envoi d'un message anonyme
FR-2: Epic 1 - Continuité de conversation par session navigateur
FR-3: Epic 1 - Confirmation immédiate à l'envoi
FR-4: Epic 3 - Authentification des organisateurs
FR-5: Epic 3 - Consultation des conversations
FR-6: Epic 3 - Réponse à une conversation
FR-7: Epic 3 - Notification quasi instantanée
FR-8: Epic 2 - Bandeau permanent de ressources d'urgence
FR-9: Epic 2 - Détection automatique de Signal de danger
FR-10: Epic 2 - Affichage immédiat des numéros d'urgence sur détection
FR-11: Epic 2 - Procédure d'escalade documentée
FR-12: Epic 4 - Point d'entrée clair vers le chat
FR-13: Epic 4 - Contenu dédié au deuxième profil
FR-14: Epic 1 - Divulgation de la limite de confidentialité
FR-15: Epic 3 - Relance automatique en cas de non-lecture
FR-16: Epic 1 - Choix du mode de conversation
FR-17: Epic 1 - Création d'un Code personnalisé de récupération
FR-18: Epic 1 - Récupération d'une conversation via Code
FR-19: Epic 1 - Mode chat éphémère

## Epic List

### Epic 1: Chat anonyme élève
Un élève peut écrire et envoyer un message sans compte, choisir de sauvegarder sa conversation (avec un Code) ou de rester en mode éphémère, recevoir un accusé de réception immédiat, et retrouver sa conversation plus tard (cookie ou Code). Inclut la mise en place du projet (Next.js + Supabase + Vercel) dans sa première story, aucun starter template n'étant imposé par l'architecture.
**FRs covered:** FR-1, FR-2, FR-3, FR-14, FR-16, FR-17, FR-18, FR-19

### Epic 2: Filet de sécurité (détection de danger)
Indépendamment de tout le reste, un message évoquant un danger sérieux déclenche systématiquement l'affichage des numéros d'urgence, et les organisateurs disposent d'une procédure écrite pour l'escalade humaine vers la CPE/counsellor. Dépend d'Epic 1 (un message doit pouvoir être envoyé pour être analysé) mais reste un bloc autonome et livrable indépendamment du reste.
**FRs covered:** FR-8, FR-9, FR-10, FR-11

### Epic 3: Organisateurs — consultation, réponse et notification
Charles et Basile s'authentifient, voient la liste des conversations (priorité visuelle sur les signaux de danger), répondent, sont notifiés sur Telegram dès qu'un message arrive, et reçoivent une relance si un message prioritaire reste non lu après 4h.
**FRs covered:** FR-4, FR-5, FR-6, FR-7, FR-15

### Epic 4: Site public autour du chat
Le site met en avant le chat comme point d'entrée central, et une section dédiée existe pour le deuxième profil (l'élève qui cherche comment bien réagir face à un camarade exclu).
**FRs covered:** FR-12, FR-13

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Chat anonyme élève

Un élève peut écrire et envoyer un message sans compte, choisir de sauvegarder sa conversation (avec un Code) ou de rester en mode éphémère, recevoir un accusé de réception immédiat, et retrouver sa conversation plus tard (cookie ou Code). Inclut la mise en place du projet (Next.js + Supabase + Vercel) dans sa première story, aucun starter template n'étant imposé par l'architecture.

### Story 1.1: Mise en place du projet et divulgation de confidentialité

As a élève qui arrive sur la page "Discussion Anonyme",
I want voir le texte expliquant la règle d'anonymat et sa limite avant de pouvoir écrire quoi que ce soit,
So that je comprends les règles du jeu avant de m'exposer.

**Acceptance Criteria:**

**Given** j'arrive pour la première fois sur la page
**When** la page se charge
**Then** le texte de confidentialité s'affiche en premier écran (pas caché derrière un lien "en savoir plus")
**And** aucun champ de saisie de message n'est actif tant que ce texte n'a pas été affiché
**And** le projet est déployé (Vercel) et connecté à une base Supabase avec les tables `Conversation`/`Message` créées

### Story 1.2: Choix du mode de conversation (sauvegarder ou éphémère)

As a élève qui vient de voir la divulgation,
I want choisir simplement entre "sauvegarder ma conversation" (avec un Code) et "chat éphémère",
So that je décide moi-même si je veux pouvoir revenir plus tard.

**Acceptance Criteria:**

**Given** la divulgation a été affichée et je n'ai ni cookie ni Code valide
**When** j'arrive à cette étape
**Then** deux options simples sans jargon me sont présentées
**And** si je choisis "Sauvegarder", je crée mon propre Code (alphanumérique, 6 à 20 caractères) ; si ce Code est déjà pris, un message clair me demande d'en choisir un autre ; je suis averti que ce Code est un secret à ne pas partager
**And** si je choisis "Éphémère", aucun cookie ni Code n'est créé, et je suis prévenu que je ne pourrai pas revenir lire une réponse
**And** le champ de saisie du premier message ne s'active qu'une fois ce choix (et la création du Code si besoin) terminé

### Story 1.3: Envoi du premier message et accusé de réception

As a élève ayant choisi mon mode,
I want écrire et envoyer mon message et recevoir une confirmation immédiate,
So that je sais que mon message est bien parti sans attendre une réponse humaine.

**Acceptance Criteria:**

**Given** j'ai terminé la divulgation et le choix de mode
**When** j'écris un message et clique envoyer
**Then** le message est enregistré, associé à ma Conversation, sans aucun champ d'identité (nom/email/identifiant)
**And** ça fonctionne aussi bien sur mobile que sur desktop
**And** un accusé de réception s'affiche en moins de 2 secondes, texte choisi aléatoirement parmi plusieurs variantes pré-écrites, qui ne promet jamais une réponse "immédiate"

### Story 1.4: Retour automatique via le navigateur

As a élève qui a sauvegardé ma conversation et qui reviens sur le même appareil,
I want retrouver ma conversation automatiquement,
So that je n'ai rien à ressaisir.

**Acceptance Criteria:**

**Given** j'ai déjà une Conversation liée à mon navigateur (cookie)
**When** je rouvre la page
**Then** ma conversation et les réponses reçues s'affichent directement, sans repasser par la divulgation ni le choix de mode
**And** si le cookie est absent et qu'aucun Code n'est saisi, une nouvelle Conversation vierge est créée sans erreur ni blocage

### Story 1.5: Récupération d'une conversation via Code

As a élève qui a créé un Code,
I want le saisir depuis n'importe quel appareil pour retrouver ma conversation,
So that je ne suis pas bloqué sur un seul appareil.

**Acceptance Criteria:**

**Given** j'ai un Code valide
**When** je le saisis
**Then** ma conversation complète (historique + réponses) s'affiche
**And** si je saisis un Code invalide, un message d'erreur générique s'affiche, identique qu'un Code proche existe ou non
**And** après 5 échecs consécutifs depuis la même IP en 15 minutes, la vérification de Code est bloquée 15 minutes pour cette IP

## Epic 2: Filet de sécurité (détection de danger)

Indépendamment de tout le reste, un message évoquant un danger sérieux déclenche systématiquement l'affichage des numéros d'urgence, et les organisateurs disposent d'une procédure écrite pour l'escalade humaine vers la CPE/counsellor. Dépend d'Epic 1 (un message doit pouvoir être envoyé pour être analysé) mais reste un bloc autonome et livrable indépendamment du reste. Note : la partie "notifier les deux organisateurs sur Telegram" de FR-10 est terminée dans l'Epic 3, une fois le canal Telegram construit — cette epic se limite au marquage prioritaire en base et à l'affichage élève, sans dépendre d'une story future.

### Story 2.1: Bandeau permanent de numéros d'urgence

As a élève sur le chat,
I want toujours voir les numéros d'urgence, indépendamment de toute détection automatique,
So that j'y ai accès même si la détection est en panne ou rate quelque chose.

**Acceptance Criteria:**

**Given** je suis sur n'importe quel écran du chat
**Then** un bandeau/lien vers les numéros d'urgence (UK) est visible sans clic caché
**And** ce bandeau ne dépend d'aucun mécanisme de détection — il reste affiché même si la détection automatique est désactivée ou en panne

### Story 2.2: Détection automatique de Signal de danger et affichage immédiat des numéros

As a élève qui écrit un message évoquant un danger sérieux,
I want voir immédiatement les numéros d'urgence pertinents sans attendre une réponse humaine,
So that j'ai de l'aide tout de suite, quelle que soit la rapidité d'un organisateur à lire mon message.

**Acceptance Criteria:**

**Given** j'envoie un message contenant un mot-clé/expression de la liste de danger
**When** le message est envoyé
**Then** le système le détecte côté serveur avant l'écriture en base et avant l'accusé de réception
**And** les numéros d'urgence pertinents (nationaux UK + ligne CPE/counsellor) s'affichent immédiatement, dans la même interaction, sans rechargement de page
**And** la Conversation est marquée prioritaire en base de données (`is_priority = true`), prête à être utilisée par l'interface organisateurs (Epic 3)
**And** la liste de mots-clés est un fichier de configuration versionné (`lib/danger-keywords.ts`) — la modifier veut dire éditer ce fichier et redéployer
**And** le modèle de données prévoit dès maintenant un champ pour qu'un Organisateur puisse, plus tard (Epic 3), signaler rétroactivement un message qui aurait dû être détecté (`flagged_missed_danger`)

### Story 2.3: Procédure d'escalade humaine documentée

As a organisateurs (Charles et Basile),
I want une procédure écrite claire pour savoir quand et comment alerter la CPE/counsellor après un Signal de danger,
So that je sais exactement quoi faire et comment prendre soin de moi-même après, sans devoir improviser dans un moment stressant.

**Acceptance Criteria:**

**Given** un Signal de danger est détecté
**When** un Organisateur consulte la procédure
**Then** il y trouve : les critères de gravité qui justifient l'appel, les coordonnées à jour de la CPE/counsellor, ce qui peut/doit être dit (jamais l'identité de l'Élève), et un point de contact pour un debrief après un signalement difficile
**And** ce document est externe au produit logiciel (ex. document partagé), pas une fonctionnalité du chat

## Epic 3: Organisateurs — consultation, réponse et notification

Charles et Basile s'authentifient, voient la liste des conversations (priorité visuelle sur les signaux de danger), répondent, sont notifiés sur Telegram dès qu'un message arrive, et reçoivent une relance si un message prioritaire reste non lu après 4h. Complète ici la partie "notification aux deux organisateurs" de FR-10, restée en suspens depuis l'Epic 2.

### Story 3.1: Authentification des organisateurs

As a Charles ou Basile,
I want me connecter de façon sécurisée,
So that seuls nous deux puissions accéder aux conversations.

**Acceptance Criteria:**

**Given** je ne suis pas connecté
**When** j'essaie d'accéder à l'interface organisateurs
**Then** l'accès est refusé
**And** exactement deux comptes existent (un par organisateur), provisionnés manuellement dans le dashboard Supabase — aucune inscription en libre-service

### Story 3.2: Consultation des conversations

As a organisateur authentifié,
I want voir la liste des conversations avec un indicateur clair des messages non traités,
So that je priorise mon temps de réponse limité.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'ouvre la liste des conversations
**Then** celles avec un message non traité se distinguent visuellement de celles déjà répondues
**And** les conversations marquées prioritaires par la détection de danger (Epic 2, `is_priority`) apparaissent visuellement en priorité dans cette liste

### Story 3.3: Réponse à une conversation

As a organisateur authentifié,
I want écrire et envoyer une réponse dans une conversation,
So that l'élève la voie à sa prochaine visite.

**Acceptance Criteria:**

**Given** j'ouvre une conversation
**When** j'envoie une réponse
**Then** elle est immédiatement visible par l'élève à sa prochaine visite
**And** les deux organisateurs voient les mêmes conversations et peuvent tous les deux répondre — aucune conversation n'est réservée à l'un des deux

### Story 3.4: Notification instantanée sur nouveau message (et notification double en cas de priorité)

As a organisateur,
I want être notifié sur Telegram dès qu'un nouveau message arrive,
So that je peux répondre dans un délai raisonnable sans surveiller le site en continu.

**Acceptance Criteria:**

**Given** un élève envoie un message
**When** le message est enregistré
**Then** au moins un organisateur reçoit une notification Telegram (cible : moins de 10 minutes dans 90% des cas en heures d'ouverture)
**And** si la conversation est marquée prioritaire (Signal de danger, Epic 2), la notification part vers les deux organisateurs simultanément — ceci termine FR-10, resté partiellement ouvert depuis l'Epic 2

### Story 3.5: Relance automatique en cas de non-lecture d'un message prioritaire

As a organisateur,
I want une seconde notification renforcée si aucun de nous deux n'a ouvert une conversation prioritaire dans les 4 heures,
So that un message grave n'est jamais silencieusement oublié.

**Acceptance Criteria:**

**Given** une conversation prioritaire n'a été ouverte par aucun organisateur depuis 4 heures
**When** la tâche planifiée s'exécute
**Then** une seconde notification part vers les deux organisateurs simultanément

## Epic 4: Site public autour du chat

Le site met en avant le chat comme point d'entrée central, et une section dédiée existe pour le deuxième profil (l'élève qui cherche comment bien réagir face à un camarade exclu).

### Story 4.1: Point d'entrée clair vers le chat

As a élève arrivant sur la page d'accueil,
I want atteindre le chat en un clic,
So that je peux commencer à écrire immédiatement sans chercher.

**Acceptance Criteria:**

**Given** je suis sur la page d'accueil
**When** je cherche le chat
**Then** je l'atteins en un clic maximum
**And** aucune page du site ne présente le chat comme "à venir" ou promotionnel

### Story 4.2: Section dédiée au deuxième profil

As a élève sollicité par un camarade exclu que je ne souhaite pas fréquenter,
I want trouver des repères sur comment répondre avec respect sans me sentir obligé,
So that je peux agir même sans passer par le chat si je préfère.

**Acceptance Criteria:**

**Given** je cherche ces repères
**When** je navigue le site
**Then** cette section est accessible depuis la navigation principale, distincte du chat
**And** le chat reste ouvert à ce profil pour poser des questions individuelles — cette section est un complément, pas un substitut
</content>
