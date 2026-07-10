---
title: "La Parole Avant Tout — Chat Anonyme"
status: final
created: 2026-07-06
updated: 2026-07-10
---

# PRD : La Parole Avant Tout — Chat Anonyme
*Titre de travail — à confirmer.*

## 0. Objet du document

Ce PRD s'adresse à Charles et à son binôme, les deux organisateurs-développeurs du projet, comme référence unique pour construire le chat anonyme du site "La Parole Avant Tout". Il part du [brief produit](../../briefs/brief-la-parole-contre-tous-2026-07-06/brief.md) déjà validé (et de son addendum) sans le dupliquer : ce PRD traduit les décisions du brief en fonctionnalités et exigences testables. Vocabulaire ancré dans le Glossaire (§3) ; fonctionnalités regroupées avec exigences fonctionnelles (FR) imbriquées et numérotées globalement ; hypothèses inférées marquées `[ASSUMPTION]` et indexées en fin de document (§9). Ce document ne couvre pas le choix technique du canal de notification ni l'hébergement — ces décisions reviennent à la phase d'architecture (`bmad-architecture`), avec le principe directeur déjà acté : la solution la plus simple à construire et maintenir par une équipe de deux débutants.

## 1. Vision

"La Parole Avant Tout" doit devenir l'endroit où un élève du Lycée Français Charles de Gaulle de Londres qui traverse le harcèlement, l'exclusion, ou simplement l'incertitude sur comment bien réagir face à un camarade marginalisé, sait qu'il peut écrire — sans compte, sans révéler qui il est — et qu'une personne réelle, elle-même élève du lycée, va lire et répondre. Pas un formulaire de contact, pas un chatbot : un vrai espace de parole avec un vrai filet de sécurité derrière.

Le produit tient sa promesse à deux niveaux à la fois. Au niveau relationnel, il remplace la solitude ("je ne peux en parler à personne sans être exposé") par une proximité crédible : ce sont des pairs qui répondent, pas des adultes, ce qui change concrètement qui ose écrire. Au niveau de la sécurité, il assume que la confiance donnée par l'anonymat ne doit jamais se retourner contre l'élève au moment où sa vie pourrait être en jeu — d'où une détection automatique de danger qui alerte silencieusement les deux Organisateurs, couplée à l'escalade humaine vers la CPE/counsellor (§4.6), pour que le filet de sécurité ne repose jamais sur la seule vigilance passive de deux lycéens qui liraient les messages au fil de l'eau. `[DÉCISION 2026-07-10]` Ce filet n'affiche plus aucun numéro d'urgence à l'élève lui-même, à aucun moment — voir §4.5, FR-8 (retiré) et FR-10 (révisé).

Réussir, ce n'est pas seulement "le chat fonctionne techniquement" — c'est que la page "Discussion Anonyme" du site, aujourd'hui une promesse vide, devienne un mécanisme réel que le lycée peut constater de ses propres yeux. Le message clé déjà affiché sur le site, "s'exprimer est le premier pas vers le changement", cesse alors d'être un slogan sans preuve pour devenir une promesse tenue.

## 2. Utilisateurs cibles

### 2.1 Jobs To Be Done

- **En tant qu'élève qui subit du harcèlement ou de l'exclusion**, je veux pouvoir écrire ce qui m'arrive sans que qui que ce soit puisse remonter jusqu'à moi, pour être soulagé d'en parler sans risquer d'aggraver ma situation sociale.
- **En tant qu'élève face à la demande d'amitié d'un camarade exclu que je ne souhaite pas satisfaire**, je veux un endroit où poser la question "comment je fais pour ne pas le/la rejeter brutalement tout en protégeant mes limites", sans avoir à en parler ouvertement à un adulte ou à mes amis.
- **En tant qu'élève, quel que soit mon profil**, je veux savoir que si j'écris quelque chose de grave sur moi-même, on ne va pas juste "me lire" plus tard — un signal part immédiatement vers les deux Organisateurs, même si aucun des deux n'a encore ouvert mon message. `[DÉCISION 2026-07-10]` Ce signal reste invisible pour moi : je ne suis jamais prévenu, avant ou pendant, qu'une alerte a été déclenchée.
- **En tant qu'organisateur (Charles ou son binôme)**, je veux être notifié dès qu'un message arrive pour pouvoir répondre dans un délai raisonnable, sans avoir à surveiller le site en continu pendant les cours.
- **En tant qu'organisateur**, je veux pouvoir distinguer rapidement un message qui nécessite une vigilance particulière (Signal de danger) d'un message ordinaire, pour prioriser mon temps de réponse limité.

### 2.2 Non-Utilisateurs (v1)

- La CPE, la counsellor, ou tout autre adulte du lycée : ils n'utilisent pas le système directement en v1 — ils restent un contact téléphonique hors-système (voir §4.6).
- Les parents ou tuteurs : aucune interface ni notification ne leur est destinée dans ce périmètre.
- Les élèves d'autres établissements : le produit vise exclusivement la communauté du Lycée Français Charles de Gaulle de Londres en v1.

### 2.3 Parcours utilisateurs clés

- **UJ-1. Amara écrit son premier message sur ce qu'elle subit.**
  - **Persona + contexte :** Amara, en classe de troisième, est mise à l'écart par un groupe de camarades depuis plusieurs semaines. Elle a peur que parler à un adulte "fasse toute une histoire".
  - **État d'entrée :** aucune authentification, elle arrive sur la page "Discussion Anonyme" du site depuis son téléphone, en dehors des heures de cours.
  - **Parcours :** elle ouvre la page de chat → lit un texte court expliquant l'anonymat et sa limite (Signal de danger = alerte envoyée aux Organisateurs, FR-10) avant que le champ de saisie ne s'active (FR-14) → choisit "Sauvegarder ma conversation" et crée un Code personnalisé (FR-16, FR-17) → écrit son message → l'envoie.
  - **Climax :** un accusé de réception automatique s'affiche immédiatement ("Bien reçu. On te répond dès qu'on peut, on est aussi au lycée toute la journée."), lui confirmant que le message est parti sans qu'elle ait à se demander si "ça a marché".
  - **Résolution :** Amara ferme l'onglet, rassurée d'avoir été entendue sans s'être exposée. Rien ne lui est demandé (pas de compte) — juste le Code qu'elle a choisi elle-même.
  - **Cas limite :** si elle revient depuis un autre appareil ou après avoir vidé son cache, elle retrouve sa conversation en saisissant son Code (FR-18) ; si elle avait choisi le mode éphémère, en revanche, aucun retour n'est possible — c'est un choix qu'elle a fait, pas un bug.

- **UJ-2. Basile répond entre deux cours.**
  - **Persona + contexte :** Basile, le binôme de Charles, en pause de dix minutes, reçoit une notification de nouveau message.
  - **État d'entrée :** authentifié sur l'interface organisateurs, depuis son téléphone.
  - **Parcours :** il ouvre la notification → arrive directement sur la conversation d'Amara → lit le message → tape une réponse brève et bienveillante → l'envoie.
  - **Climax :** la réponse part, marquée comme lue par l'organisateur ; le compteur de messages non traités diminue.
  - **Résolution :** il retourne en cours, sachant que la conversation reste accessible pour lui et Charles à tout moment, et que la prochaine visite d'Amara affichera la réponse automatiquement.

- **UJ-3. Amara revient voir si on lui a répondu.**
  - **Persona + contexte :** Le soir même, depuis le même téléphone, Amara rouvre le site.
  - **État d'entrée :** aucune authentification ; le site reconnaît sa session via le navigateur (ou, si elle change d'appareil, elle saisit le Code qu'elle a créé, FR-18).
  - **Parcours :** elle rouvre la page "Discussion Anonyme" → sa conversation précédente s'affiche automatiquement (cookie) ou après saisie de son Code → elle voit la réponse de l'organisateur → elle peut répondre à son tour.
  - **Climax :** elle voit qu'une vraie personne a lu et répondu à ce qu'elle a écrit — c'est le moment où la confiance se confirme.
  - **Résolution :** un fil de conversation continu s'installe, sans qu'elle ait jamais eu à créer de compte.

- **UJ-4. Un message laisse penser à un danger sérieux.**
  - **Persona + contexte :** Un élève écrit une phrase qui évoque des idées noires, un soir, hors des heures de cours. Ce parcours reste volontairement sans prénom : contrairement à Amara, Basile ou Léo, il décrit un cas de danger qui peut concerner n'importe quel profil du chat (UJ-1 ou UJ-5), pas une situation propre à un persona particulier.
  - **État d'entrée :** aucune authentification, comme UJ-1.
  - **Parcours :** il écrit et envoie son message → le système détecte automatiquement des signaux de danger dans le texte (voir FR-9) → sans attendre qu'un organisateur lise le message.
  - **Climax :** `[DÉCISION 2026-07-10]` rien ne change à l'écran pour l'élève — il voit exactement le même accusé de réception que pour n'importe quel autre message (FR-3), sans aucune indication qu'une détection a eu lieu. En parallèle et silencieusement, les deux Organisateurs reçoivent une alerte immédiate et la conversation est signalée visuellement comme prioritaire côté organisateurs.
  - **Résolution :** l'organisateur, dès qu'il voit le signalement, suit le protocole d'escalade (§4.6) : il alerte la CPE/counsellor sans révéler qui est l'Élève. C'est l'Organisateur, dans sa réponse humaine à la Conversation, qui reste le seul canal par lequel l'Élève peut être orienté vers de l'aide — le produit ne montre jamais lui-même de numéro à l'Élève. `[ASSUMPTION]` la détection automatique repose sur une liste de mots-clés/expressions à risque (pas d'IA de compréhension du langage) — approche volontairement simple pour rester constructible par une équipe débutante ; à valider avec Charles.
  - **Cas limite :** un message peut évoquer un danger sans utiliser les mots-clés attendus (faux négatif) — c'est pourquoi le filet humain (l'organisateur qui lit et répond) reste la **seule** ligne de défense après la détection ; il n'y a plus de filet automatique visible pour l'élève en second recours.

- **UJ-5. Léo cherche comment ne pas rejeter brutalement un camarade exclu.** Léo, sollicité en amitié par un élève marginalisé qu'il n'a pas envie de fréquenter, écrit sur le même chat anonyme (FR-1) pour demander comment poser une limite saine sans le blesser ni se sentir obligé d'accepter une relation qu'il ne souhaite pas. Il reçoit le même accusé de réception (FR-3) et la même réponse humaine d'un organisateur (FR-6) qu'Amara — le mécanisme est identique, seul le motif du message diffère. Il peut aussi trouver des repères sans écrire, via la section dédiée du site (FR-13).

## 3. Glossaire

- **Élève** — utilisateur anonyme du chat, sans compte ni identité révélée. Peut être en position de victime de harcèlement/exclusion, ou en recherche de conseil sur comment réagir face à un camarade exclu.
- **Organisateur** — Charles ou son binôme, les deux seules personnes authentifiées pouvant consulter et répondre aux conversations.
- **Session anonyme** — mécanisme technique (cookie/navigateur) permettant à un Élève de retrouver sa Conversation automatiquement depuis le même appareil, sans rien saisir. Liée à un navigateur/appareil, pas à une identité. Absente en mode éphémère.
- **Code de récupération** — identifiant alphanumérique choisi par l'Élève (pas généré par le système) permettant de retrouver sa Conversation depuis n'importe quel appareil. Optionnel : n'existe que si l'Élève a choisi de sauvegarder sa conversation (FR-16, FR-17). Absent en mode éphémère.
- **Conversation** — fil d'échange entre un Élève (via sa Session anonyme et/ou son Code de récupération) et les Organisateurs, contenant un ou plusieurs messages dans les deux sens.
- **Accusé de réception automatique** — message affiché immédiatement après l'envoi d'un message par l'Élève, assisté par IA, confirmant la bonne réception et fixant une attente honnête de délai de réponse.
- **Signal de danger** — contenu d'un message évoquant un risque sérieux pour l'Élève (ex. idées suicidaires). Déclenche une alerte silencieuse aux Organisateurs et un signalement visuel prioritaire côté interface Organisateurs — **jamais** un affichage quelconque côté Élève (`[DÉCISION 2026-07-10]`, voir FR-10).
- **Numéros d'urgence** `[RETIRÉ, 2026-07-10]` — ancien concept : liste de contacts (Samaritans, Childline, urgences, ligne CPE/counsellor) que le système affichait à l'Élève. Ce comportement est annulé (voir FR-8, FR-10) ; ces contacts restent uniquement des informations internes à la procédure d'escalade des Organisateurs (FR-11), jamais montrées à l'Élève par le produit.
- **Protocole d'escalade** — procédure humaine suivie par les Organisateurs face à un Signal de danger qui les dépasse : une alerte téléphonique à la CPE/counsellor, sans révéler l'identité de l'Élève (que les Organisateurs ne connaissent pas), pour la préparer à recevoir un éventuel appel direct de l'Élève.
- **CPE / Counsellor** — soutien ponctuel du lycée, joignable par téléphone par les Organisateurs en cas de Signal de danger, sans accès direct au système (Non-Utilisateurs, §2.2).
- **Notification** — alerte envoyée aux Organisateurs à réception d'un nouveau message ; canal technique non figé dans ce PRD (décision d'architecture).

## 4. Fonctionnalités

### 4.1 Chat anonyme — envoi et continuité de conversation

**Description :** Un Élève arrive sur la page "Discussion Anonyme" du site, écrit un message sans créer de compte, et l'envoie. Réalise UJ-1. Avant le premier message, l'Élève voit la divulgation de confidentialité (FR-14) puis choisit un mode de conversation (FR-16) : soit il crée un Code personnalisé pour pouvoir retrouver sa Conversation plus tard, y compris depuis un autre appareil (FR-17, FR-18), en plus de la Session anonyme automatique par cookie (FR-2) ; soit il choisit un mode éphémère où rien n'est sauvegardé nulle part (FR-19). Réalise UJ-3.

**Exigences fonctionnelles :**

#### FR-1 : Envoi d'un message anonyme

Un Élève peut écrire et envoyer un message via l'interface du chat sans créer de compte ni fournir d'identité. Réalise UJ-1.

**Conséquences (testables) :**
- Aucun champ obligatoire du formulaire ne demande nom, email, ou identifiant scolaire.
- Le message envoyé est associé à une Session anonyme, jamais à une identité réelle.
- L'envoi fonctionne sur mobile et desktop (l'essentiel du trafic élève est probablement mobile).

#### FR-2 : Continuité de conversation par session navigateur

Un Élève revenant depuis le même navigateur/appareil retrouve automatiquement sa Conversation précédente, y compris les réponses des Organisateurs. Réalise UJ-3. Ne s'applique pas si l'Élève a choisi le mode éphémère (FR-19).

**Conséquences (testables) :**
- La Conversation s'affiche sans action de l'Élève au-delà d'ouvrir la page.
- Si le cookie est absent (autre appareil, cache vidé, navigation privée) et qu'aucun Code de récupération n'a été créé, une nouvelle Conversation vierge est créée — aucune erreur ni blocage.

**Hors périmètre :**
- Récupération de la Conversation sans cookie et sans Code de récupération (voir §5, Non-Goals).

#### FR-14 : Divulgation de la limite de confidentialité avant le premier message

Un Élève voit le texte expliquant la règle d'anonymat et sa limite ("anonyme, sauf en cas de danger sérieux où des ressources d'urgence s'affichent") avant de pouvoir écrire son premier message de la session. Réalise UJ-1.

**Conséquences (testables) :**
- Le champ de saisie du premier message d'une session n'est pas actif/utilisable tant que ce texte n'a pas été affiché à l'écran, ni tant que le choix de mode (FR-16) n'a pas été fait.
- Ce texte est visible en premier écran, jamais relégué à un lien "en savoir plus" non consulté par défaut.
- Cette exigence garantit l'ordre chronologique : l'information arrive avant l'écriture, jamais seulement au moment où un Signal de danger se déclenche.

#### FR-16 : Choix du mode de conversation avant le premier message

Un Élève qui n'a pas déjà une Conversation en cours (pas de cookie valide, pas de Code saisi) choisit, juste après la divulgation de confidentialité (FR-14) et avant que le champ de saisie ne s'active, entre deux modes : "Sauvegarder ma conversation" (crée un Code, FR-17) ou "Chat éphémère" (rien n'est sauvegardé, FR-19).

**Conséquences (testables) :**
- Ce choix est présenté comme une étape simple à deux options, sans jargon technique (ex. "Je veux pouvoir revenir lire la réponse" vs "Je ne reviendrai pas, je ne veux rien laisser").
- Le champ de saisie du premier message ne s'active qu'après ce choix.
- Un Élève revenant via cookie (FR-2) ou via Code (FR-18) ne revoit pas cet écran — il retrouve directement sa Conversation existante.

#### FR-17 : Création d'un Code personnalisé de récupération

Un Élève qui choisit "Sauvegarder ma conversation" (FR-16) crée lui-même un Code (pas généré par le système) qui lui permettra de retrouver sa Conversation plus tard, y compris depuis un autre appareil ou après suppression du cookie.

**Conséquences (testables) :**
- Si le Code choisi est déjà utilisé par une autre Conversation active, le système refuse et affiche un message d'erreur clair invitant l'Élève à en choisir un autre — aucune Conversation n'est créée tant que le Code n'est pas unique.
- Le Code est un identifiant alphanumérique `[ASSUMPTION]` entre 6 et 20 caractères — bornes provisoires à valider en architecture/UX, l'objectif étant d'éviter les codes trop courts (faciles à deviner) sans complexifier inutilement la saisie.
- L'Élève est averti, au moment de créer son Code, que quiconque connaît ce Code peut lire sa Conversation — donc de ne pas choisir un Code facile à deviner (prénom, date de naissance) ni de le partager.

#### FR-18 : Récupération d'une conversation via Code

Un Élève peut saisir un Code précédemment créé (FR-17) pour retrouver sa Conversation, y compris depuis un appareil différent de celui utilisé pour l'envoi initial.

**Conséquences (testables) :**
- La saisie d'un Code valide affiche la Conversation correspondante, avec l'historique complet et les réponses des Organisateurs.
- La saisie d'un Code invalide affiche un message d'erreur générique, sans indiquer si le Code existe ou non pour un autre Élève (pour ne pas faciliter le repérage de Codes existants).
- Le nombre de tentatives de saisie de Code est limité dans le temps (ex. verrouillage temporaire après plusieurs échecs) `[ASSUMPTION]` pour empêcher qu'un tiers devine un Code par essais successifs — mécanisme exact à définir en architecture.

#### FR-19 : Mode chat éphémère (sans Code, sans sauvegarde)

Un Élève qui choisit "Chat éphémère" (FR-16) envoie son message normalement — il est transmis aux Organisateurs et reste soumis à la détection de Signal de danger (FR-9, FR-10) comme n'importe quel message — mais aucun Code n'est créé et la Session anonyme par cookie (FR-2) n'est pas activée : l'Élève ne pourra pas revenir lire une réponse.

**Conséquences (testables) :**
- Le message envoyé en mode éphémère est visible par les Organisateurs (FR-5) et déclenche FR-9/FR-10 exactement comme un message en mode sauvegardé.
- Aucun cookie de continuité n'est posé et aucun Code n'est demandé à l'Élève dans ce mode.
- L'Élève est informé, au moment de choisir ce mode, qu'il ne pourra pas revenir lire une éventuelle réponse — pour que ce soit un choix éclairé, pas une surprise.

### 4.2 Accusé de réception automatique

**Description :** Dès l'envoi d'un message, l'Élève reçoit une confirmation immédiate, formulée pour fixer une attente honnête plutôt qu'une promesse de rapidité intenable. Réalise UJ-1.

#### FR-3 : Confirmation immédiate à l'envoi

Un Élève voit s'afficher, immédiatement après l'envoi de son message, un accusé de réception qui confirme la bonne réception et indique un délai de réponse honnête (ex. "sous la journée").

**Conséquences (testables) :**
- L'accusé de réception s'affiche sans délai perceptible (< 2 secondes) après l'envoi.
- Le texte ne promet jamais une réponse "immédiate" ou "instantanée" de la part d'un humain.
- Le texte est généré ou assisté par IA `[ASSUMPTION]` mais reste cohérent et non générique-robotique — à valider avec un premier jet concret lors de l'architecture/UX.

### 4.3 Interface organisateurs

**Description :** Charles et son binôme consultent et répondent aux Conversations depuis une interface qui leur est propre, accessible uniquement après authentification. Réalise UJ-2.

#### FR-4 : Authentification des organisateurs

Seuls les deux Organisateurs peuvent s'authentifier pour accéder à l'interface de gestion des Conversations.

**Conséquences (testables) :**
- Aucun accès aux Conversations n'est possible sans authentification réussie.
- Seuls deux comptes existent (un par Organisateur) — pas de création de compte en libre-service.

#### FR-5 : Consultation des conversations

Un Organisateur authentifié peut voir la liste des Conversations, avec un indicateur clair des messages non lus/non traités.

**Conséquences (testables) :**
- La liste distingue visuellement les Conversations avec un message non traité de celles déjà répondues.
- Les Conversations signalées par un Signal de danger (FR-9) sont visuellement prioritaires dans cette liste. Réalise UJ-4.

#### FR-6 : Réponse à une conversation

Un Organisateur authentifié peut écrire et envoyer une réponse dans une Conversation. Réalise UJ-2.

**Conséquences (testables) :**
- La réponse envoyée est immédiatement visible par l'Élève à sa prochaine visite (FR-2).
- Les deux Organisateurs voient les mêmes Conversations et peuvent tous les deux répondre (pas de conversation assignée exclusivement à l'un des deux).

### 4.4 Notification aux organisateurs

**Description :** Les Organisateurs sont notifiés rapidement à la réception d'un nouveau message, pour pouvoir répondre dans un délai raisonnable malgré leur emploi du temps de lycéens. Réalise UJ-2. Le canal technique exact (email, WhatsApp, push web, autre) est explicitement **hors périmètre de ce PRD** — décision différée à l'architecture (voir addendum du brief pour les options déjà discutées).

#### FR-7 : Notification quasi instantanée

Un Organisateur est notifié après qu'un Élève envoie un nouveau message, via un canal à déterminer en architecture.

**Conséquences (testables) :**
- Au moins un Organisateur reçoit la notification en moins de 10 minutes dans au moins 90 % des cas pendant les heures d'ouverture habituelles du service (hors nuit profonde). `[ASSUMPTION]` seuil provisoire à ajuster une fois le canal choisi en architecture — l'important est qu'il soit chiffré, pas qu'il soit exactement ce nombre.
- La notification fonctionne indépendamment du fait que le message contienne ou non un Signal de danger (voir aussi FR-10 pour la priorisation en cas de danger, et FR-15 pour le plancher de secours).

### 4.5 Détection de Signal de danger et alerte aux organisateurs `[RENOMMÉ, 2026-07-10]`

**Description :** Le filet de sécurité automatique du produit : indépendamment de la rapidité de réponse des Organisateurs, un message évoquant un danger sérieux déclenche systématiquement une alerte immédiate et silencieuse vers les deux Organisateurs. Réalise UJ-4. `[DÉCISION 2026-07-10]` Ce filet n'affiche plus rien à l'Élève, ni en permanence (ancien FR-8, retiré) ni au moment de la détection (FR-10, révisé) — raison : avertir ou montrer quoi que ce soit à l'Élève sur ce sujet risquerait de provoquer l'auto-censure d'un élève réellement en détresse, ou de suggérer à tort qu'une aide automatique existe alors que seule la lecture humaine agit. `[ASSUMPTION]` mécanisme de détection proposé : liste de mots-clés/expressions à risque (pas de modèle d'IA de compréhension du langage), pour rester simple à construire et faire évoluer par une équipe débutante. À confirmer avec Charles — voir §8, Questions ouvertes.

#### FR-8 : ~~Bandeau permanent de ressources d'urgence~~ `[RETIRÉ, 2026-07-10]`

**Décision de Charles (2026-07-10) :** ce FR est annulé. L'interface de chat n'affiche **aucun** numéro d'urgence à l'Élève, ni en permanence ni sur détection — cette exigence a été implémentée puis retirée avant tout déploiement en production (voir Story 2.1, `_bmad-output/implementation-artifacts/2-1-bandeau-permanent-de-numeros-durgence.md`). Conservé ici numéroté (au lieu d'être supprimé) pour ne pas décaler la numérotation des FR suivants et pour garder une trace de ce qui a été envisagé puis écarté.

**Conséquence produit** : le filet de sécurité automatique du produit (§1, Vision) perd son volet visible côté Élève. Seule la détection silencieuse (FR-9/FR-10, qui alerte les Organisateurs) et l'escalade humaine (FR-11) subsistent comme filet — voir NFR "Résilience du filet de sécurité" (également retiré, §11).

#### FR-9 : Détection automatique de Signal de danger

Le système analyse chaque message envoyé par un Élève à la recherche de mots-clés ou expressions associés à un risque sérieux (idées suicidaires, automutilation), et déclenche une réponse automatique immédiate si une correspondance est trouvée.

**Conséquences (testables) :**
- La détection s'exécute au moment de l'envoi, avant toute lecture humaine.
- Un message correspondant déclenche systématiquement FR-10, sans exception ni validation humaine préalable.
- La liste de mots-clés est révisable par les Organisateurs sans intervention technique lourde `[ASSUMPTION]` — à confirmer si c'est un besoin réel dès la v1 ou si un fichier de config suffit.
- Un Organisateur peut marquer rétroactivement une Conversation comme "aurait dû déclencher FR-9 mais ne l'a pas fait" — ce signalement alimente une revue régulière de la liste de mots-clés (voir SM-2bis, §7).

#### FR-10 : Alerte silencieuse aux Organisateurs sur détection `[RÉVISÉ, 2026-07-10]`

Dès qu'un Signal de danger est détecté (FR-9), une alerte est envoyée immédiatement aux deux Organisateurs — **sans jamais rien afficher, annoncer, ni suggérer à l'Élève**, ni au moment de l'envoi ni à aucun autre moment de sa session. `[DÉCISION 2026-07-10]` Version précédente de ce FR (affichage immédiat des numéros d'urgence à l'Élève) annulée sur décision de Charles, cohérente avec le retrait de FR-8 : l'Élève ne doit voir aucun numéro d'urgence nulle part dans le produit, y compris en cas de détection.

**Conséquences (testables) :**
- La détection déclenche l'alerte dans la même interaction que l'envoi du message (pas de rechargement de page requis), côté serveur uniquement.
- L'Élève ne reçoit et ne voit strictement rien de différent d'un message ordinaire (même accusé de réception, FR-3) — l'alerte est invisible pour lui.
- La Conversation correspondante est simultanément marquée prioritaire pour les Organisateurs (FR-5), et la notification (FR-7) part vers les **deux** Organisateurs simultanément dans ce cas précis — jamais un seul face à la décision d'escalade.
- C'est dans l'interface Organisateurs, jamais dans l'interface Élève, que la CPE/counsellor et les numéros nationaux (Samaritans, Childline, urgences) peuvent être référencés — comme aide-mémoire pour l'Organisateur qui suit le protocole d'escalade (FR-11), jamais comme contenu montré à l'Élève.

**NFR spécifiques à cette fonctionnalité :**
- Faux négatifs (un vrai Signal de danger non détecté) : atténués par le fait que les Organisateurs lisent tout de même chaque message humainement — la détection automatique est un filet supplémentaire, jamais un substitut à la lecture humaine. Ce filet humain est désormais la **seule** ligne de défense après la détection, l'Élève n'ayant plus aucun accès automatique à une ressource d'urgence via le produit.
- Faux positifs (déclenchement sur un message qui n'évoque pas réellement un danger) : sans impact visible pour l'Élève (rien ne s'affiche jamais chez lui) — le coût d'un faux positif se limite désormais à une conversation marquée prioritaire à tort côté Organisateurs, pas à une lassitude côté Élève (voir SM-C1, §7, reformulée en conséquence).

#### FR-15 : Relance automatique en cas de non-lecture d'un message prioritaire

Un message marqué prioritaire (Signal de danger détecté, FR-9/FR-10) qui n'est ouvert par aucun Organisateur dans un délai plancher fixe déclenche une relance automatique renforcée.

**Conséquences (testables) :**
- Si aucun des deux Organisateurs n'a ouvert la Conversation signalée prioritaire dans les 4 heures suivant la détection, une seconde notification est envoyée aux deux Organisateurs simultanément, sur un canal jugé plus difficile à manquer (ex. répétée, ou canal de secours défini en architecture).
- Ce délai de 4h est un plancher explicite (pire cas), distinct de la cible de quelques minutes visée par FR-7 pour le cas normal.
- `[ASSUMPTION]` le mécanisme technique exact de la relance (répétition du même canal vs canal de secours dédié) est une décision d'architecture ; ce FR fixe seulement le comportement attendu côté produit.

### 4.6 Protocole d'escalade humaine

**Description :** Face à un Signal de danger, les Organisateurs alertent par téléphone la CPE ou la counsellor du lycée — sans jamais leur transmettre l'identité de l'Élève, qu'ils ne connaissent pas eux-mêmes. Réalise UJ-4. Cette alerte a un objectif précis et limité : prévenir la CPE/counsellor qu'un appel direct de l'Élève est possible (sa ligne étant affichée parmi les Numéros d'urgence, FR-10), pas lui transmettre un dossier identifié. L'identification, si elle a lieu, reste entièrement à l'initiative de l'Élève.

Ce protocole reste humain et non-systémique : la CPE/counsellor n'ont aucun accès au système (§2.2). Le choix d'un accès fermé aux deux Organisateurs, plutôt qu'un accès système partagé avec un adulte référent, est assumé en connaissance de cause pour cette version — mais reste explicitement **réversible** : si le lycée, une fois le projet présenté, souhaite formaliser un accès pour un adulte référent, la décision peut être révisée sans remettre en cause le reste du produit.

#### FR-11 : Procédure d'escalade documentée

Les Organisateurs disposent d'une procédure claire et écrite (hors du système, ex. document de référence) décrivant quand et comment alerter la CPE/counsellor face à un Signal de danger, et comment prendre soin d'eux-mêmes après un signalement difficile.

**Conséquences (testables) :**
- La procédure précise au minimum : critères de gravité qui justifient l'appel, coordonnées à jour de la CPE/counsellor, ce qui peut/doit être dit (jamais l'identité de l'Élève), et un point de contact que les Organisateurs peuvent eux-mêmes solliciter pour un debrief après un signalement grave.
- `[ASSUMPTION]` cette procédure est un document/checklist externe au produit logiciel (pas une fonctionnalité du chat) — à confirmer que c'est bien ce que Charles attend de ce PRD plutôt qu'un livrable séparé.

**Notes :** `[NOTE FOR PM]` l'accord de la CPE/counsellor est aujourd'hui oral — sa confirmation écrite est un prérequis bloquant de lancement public, pas une simple question ouverte. Détail complet en §8, Prérequis avant lancement public.

### 4.7 Réorganisation du site autour du chat

**Description :** Le site existant (Wix) doit être réorganisé pour que le chat anonyme soit clairement l'entrée centrale, et pour que le deuxième volet du problème (comment bien réagir face à un camarade exclu, sans se sentir obligé) soit visible ailleurs sur le site, au-delà du seul chat.

#### FR-12 : Point d'entrée clair vers le chat

Le site met en avant le chat anonyme comme fonctionnalité centrale, remplaçant le texte promotionnel actuel de la section "Discussion Anonyme" par l'accès réel au chat.

**Conséquences (testables) :**
- Depuis la page d'accueil, un élève atteint le chat fonctionnel en un clic maximum.
- Aucune page du site ne présente le chat comme "à venir" ou promotionnel une fois ce PRD livré.

#### FR-13 : Contenu dédié au deuxième profil (camarade cherchant à bien réagir)

Le site présente, dans une section dédiée distincte du chat, des repères sur comment répondre avec respect à un camarade exclu sans se sentir obligé d'accepter une relation non désirée.

**Conséquences (testables) :**
- Cette section est accessible depuis la navigation principale, pas seulement mentionnée dans le chat.
- Le chat lui-même reste ouvert à ce profil pour poser des questions individuelles (FR-1), cette section n'étant pas un substitut mais un complément.

## 5. Non-Goals explicites

- Le produit ne construit pas de compte utilisateur ni d'identité persistante pour les Élèves — l'anonymat est la fonctionnalité, pas un mode dégradé.
- Le produit ne permet pas de récupérer une Conversation anonyme sans Code de récupération — un Élève qui choisit le mode éphémère (FR-19), ou qui a créé un Code puis l'a perdu, ne peut pas retrouver sa Conversation. C'est un compromis assumé pour rester simple, pas un oubli.
- Le produit ne propose pas de récupération de Code oublié (ex. par email) — un Code perdu est définitivement perdu, cohérent avec l'absence de toute identité collectée.
- Le produit ne donne aucun accès direct au système pour la CPE, la counsellor, ou tout autre adulte du lycée (voir §2.2, Non-Utilisateurs) — le filet humain reste téléphonique et hors-système.
- Le produit n'implémente pas de détection de danger basée sur un modèle d'IA de compréhension du langage — la v1 reste volontairement simple (mots-clés), constructible par une équipe débutante.
- Le produit ne dépend pas d'une adoption officielle du lycée pour être construit ou lancé — l'objectif immédiat est de présenter un outil qui fonctionne déjà.
- Le produit n'inclut pas les podcasts ni les articles évoqués comme extension future — sujet d'un brief séparé.
- Le produit ne fixe pas dans ce PRD le canal technique de notification (WhatsApp, email, autre) — décision d'architecture.

## 6. Périmètre MVP

Aucune deadline externe ne contraint ce périmètre : le lancement a lieu quand l'équipe se sent prête, pas à une date imposée. Cette absence de pression de calendrier est une donnée du projet, pas une négligence.

### 6.1 Dans le périmètre

- Chat anonyme fonctionnel (envoi, choix sauvegarde-par-code vs éphémère, continuité par cookie et/ou Code, divulgation de la limite de confidentialité, accusé de réception) — §4.1, §4.2.
- Interface organisateurs (authentification, consultation, réponse) — §4.3.
- Notification rapide aux organisateurs, avec relance automatique en cas de non-lecture d'un message prioritaire, canal à déterminer en architecture — §4.4, §4.5 (FR-15).
- Détection automatique de Signal de danger déclenchant une alerte silencieuse aux Organisateurs, sans aucun affichage de numéro d'urgence côté Élève (`[DÉCISION 2026-07-10]`, ancien FR-8 retiré) — §4.5.
- Ébauche de procédure d'escalade humaine vers la CPE/counsellor — §4.6 (prête pour construire ; sa confirmation formelle est un prérequis de lancement public distinct, voir §8).
- Réorganisation du site autour du chat + section dédiée au deuxième profil — §4.7.

### 6.2 Hors périmètre pour le MVP

- Canal exact de notification (WhatsApp/email/autre) — différé à l'architecture.
- Accès direct de la CPE/counsellor au système — reste un contact téléphonique hors-système.
- Détection de danger par IA/ML — v1 reste à base de mots-clés, plus simple à maintenir.
- Récupération de Code oublié (ex. par email) — un Code perdu est définitivement perdu.
- Podcasts et articles — brief séparé à venir.
- Adoption officielle par le lycée — non bloquante pour construire et lancer.

## 7. Critères de succès

**Principaux**
- **SM-1** : 100 % des messages envoyés reçoivent un accusé de réception automatique immédiat (< 2 s). Valide FR-3.
- **SM-2** : 100 % des messages détectés comme Signal de danger déclenchent une alerte aux Organisateurs, sans exception. Valide FR-9, FR-10. `[RÉVISÉ 2026-07-10]` (mesurait auparavant l'affichage de numéros à l'Élève, FR-8/FR-10 désormais retiré/révisé)
- **SM-2bis** : Nombre de Conversations signalées a posteriori par un Organisateur comme "aurait dû déclencher FR-9 mais ne l'a pas fait", revu mensuellement pour mettre à jour la liste de mots-clés. Contrairement à SM-2 (câblage mécanique), cette métrique mesure le taux réel de faux négatifs de la détection. Valide FR-9.
- **SM-3** : Délai médian de première réponse humaine à un message sous 24h (cible honnête, cohérente avec l'emploi du temps d'organisateurs lycéens). Valide FR-6, FR-7.
- **SM-4** : Zéro fuite d'identité d'un Élève en dehors des deux Organisateurs authentifiés (aucun accès tiers constaté). Valide FR-1, FR-4.

**Secondaires**
- **SM-5** : Le lycée (CPE, direction), lors d'une présentation, peut constater un outil fonctionnel et obtenir une réponse claire à "que se passe-t-il en cas d'urgence ?". Valide FR-10, FR-11. `[RÉVISÉ 2026-07-10]` (référence à FR-8 retirée, FR annulé)

**Contre-métriques (à ne pas optimiser)**
- **SM-C1** : Le taux de faux positifs de la détection de Signal de danger (FR-9) ne doit pas être optimisé à la baisse au prix de rater de vrais signaux — mieux vaut une conversation marquée prioritaire "à tort" occasionnellement côté Organisateurs qu'un vrai signal manqué. Contrebalance une tentation future de rendre la détection "moins sensible" pour réduire le bruit. `[RÉVISÉ 2026-07-10]` (le coût d'un faux positif ne concerne plus l'Élève, FR-8 retiré — seuls les Organisateurs voient une priorisation à tort)
- **SM-C2** : Le délai de réponse (SM-3) ne doit pas être optimisé au prix de réponses expédiées ou impersonnelles — la qualité et la chaleur humaine de la réponse priment sur la vitesse pure. Contrebalance SM-3.

## 8. Questions ouvertes

1. Le mécanisme de détection de Signal de danger proposé ici (liste de mots-clés, §4.5) est une hypothèse à valider avec Charles. `[MISE À JOUR 2026-07-10]` L'alternative évoquée précédemment (aucune détection automatique, se reposer sur un bandeau permanent) n'est plus disponible : FR-8 a été retiré, l'Élève ne doit voir aucun numéro d'urgence via le produit — si la détection automatique s'avère trop lourde à maintenir, la seule alternative restante est la lecture humaine seule (sans filet automatique du tout), à trancher explicitement avec Charles plutôt que présumée par défaut.
2. Qui maintient durablement le nom de domaine et l'hébergement (renouvellement, sécurité, sauvegardes) — question ouverte identifiée dans l'addendum du brief, probablement Charles et son binôme avec accompagnement.
3. Le canal technique de notification (WhatsApp, email, push web) — à trancher en architecture, pas dans ce PRD.
4. Le seuil provisoire de FR-7 (10 min / 90 %) et le plancher de FR-15 (4h) sont des propositions de départ, pas des chiffres validés par retour d'expérience — à ajuster une fois le canal choisi et le produit en usage réel.

### Prérequis avant lancement public

Ces points ne bloquent pas la construction du produit, mais bloquent explicitement toute présentation ou ouverture au lycée tant qu'ils ne sont pas résolus :

- **Accord CPE/counsellor confirmé par écrit**, incluant la disponibilité réelle en dehors des heures de cours (le chat étant accessible en continu) — actuellement un accord oral seulement (brief, §Protocole de sécurité ; voir FR-11).
- **Statut légal du projet clarifié** vis-à-vis du lycée (initiative élève indépendante vs service reconnu par l'établissement) — détermine qui est responsable du traitement des données au sens du UK GDPR / Children's Code de l'ICO. `[NOTE FOR PM]` mérite un avis extérieur (juridique ou lycée), pas seulement une lecture de ce PRD.
- **Capacité des deux Organisateurs, mineurs, à porter cette responsabilité** validée par un adulte de confiance (école ou parent) — le brief documente un choix assumé, mais aucune vérification externe de cette capacité n'a eu lieu à ce jour.
- **Durée de conservation des Conversations et politique de suppression** définie — non tranchée ; pertinent au vu du caractère sensible des données (santé mentale de mineurs) signalé par la recherche de cadrage (voir addendum, §Contraintes légales UK).
- **Liste des numéros d'urgence (nationaux + CPE/counsellor) validée** dans sa forme finale, pour usage interne des Organisateurs dans le cadre du protocole d'escalade (FR-11) — celle citée dans l'addendum est une recherche de cadrage, pas une liste confirmée. `[MISE À JOUR 2026-07-10]` Ne concerne plus un affichage produit côté Élève (FR-8/FR-10 ne montrent plus rien à l'Élève) : cette liste sert uniquement d'aide-mémoire aux Organisateurs eux-mêmes.

## 9. Index des hypothèses

- §2.3 (UJ-4) — la détection automatique de danger repose sur des mots-clés, pas sur une IA de compréhension du langage.
- §4.1 (FR-1 intro) — la Session anonyme est un cookie de longue durée (ex. 12 mois), pas une session de navigateur expirant à la fermeture.
- §4.2 (FR-3) — l'accusé de réception est généré ou assisté par IA mais doit rester chaleureux, pas générique.
- §4.4 (FR-7) — seuil provisoire de 10 minutes / 90 % des cas, à ajuster une fois le canal de notification choisi.
- §4.5 (description) — mécanisme de détection par mots-clés révisables par les Organisateurs.
- §4.5 (FR-9) — la liste de mots-clés doit être révisable sans intervention technique lourde.
- §4.5 (FR-15) — le mécanisme technique exact de la relance (canal répété vs canal de secours) reste une décision d'architecture.
- §4.6 (FR-11) — la procédure d'escalade est un document externe au produit logiciel, pas une fonctionnalité du chat.
- §4.1 (FR-17) — bornes provisoires du Code personnalisé (6 à 20 caractères alphanumériques), à valider en architecture/UX.
- §4.1 (FR-18) — le mécanisme exact de limitation des tentatives de saisie de Code (anti-brute-force) reste une décision d'architecture.

## 10. Contraintes et garde-fous

### Sécurité et confidentialité (pièce centrale du produit)

- **Accès restreint** : seuls les deux Organisateurs authentifiés peuvent lire les Conversations — aucun tiers, y compris la CPE/counsellor, n'a d'accès direct (FR-4).
- **Le Code de récupération est un secret, pas un identifiant** : quiconque le connaît accède à la Conversation (FR-18). L'Élève en est averti à la création (FR-17), et la limitation des tentatives de saisie (FR-18) réduit le risque qu'un tiers le devine par essais successifs — un Code choisi par l'Élève étant par nature moins imprévisible qu'un code généré aléatoirement.
- **Anonymat total, y compris en cas de danger** : contrairement à des services comme Crisis Text Line ou Childline UK qui peuvent, en dernier recours, tracer un appelant, ce produit ne lève jamais l'anonymat de son propre chef (voir mécanisme complet en §4.5/§4.6) — l'Élève en est informé avant d'écrire (FR-14).
- **Filet à un étage visible pour l'Élève, deux étages côté produit** `[RÉVISÉ 2026-07-10]` : détection silencieuse (FR-9, FR-10) + relance (FR-15), qui alertent uniquement les Organisateurs, jamais l'Élève ; puis escalade humaine (FR-11). L'ancien FR-8 (bandeau permanent visible par l'Élève) est retiré — il n'existe donc plus de filet automatique *visible* par l'Élève lui-même, uniquement un filet automatique *agissant en coulisse* vers les Organisateurs, suivi du filet humain.
- **Responsabilité assumée** : les Organisateurs portent explicitement la responsabilité de premier niveau des échanges, en connaissance de cause (choix documenté dans le brief).
- **Risque structurel assumé** : contrairement aux services comparables (Crisis Text Line, Childline, 3018 — voir addendum), ce produit fonctionne sans supervision adulte ou clinique en temps réel sur les messages. Ce n'est pas un oubli mais un compromis délibéré du brief, atténué par le filet à deux étages ci-dessus — à garder en tête si le produit gagne en visibilité ou en volume de messages.

### Conformité (à valider, pas à ignorer)

- Les messages évoquant la santé mentale ou des idées suicidaires constituent une catégorie de données sensible au sens du UK GDPR / Data Protection Act 2018, ce qui implique des exigences renforcées de sécurité de stockage et d'accès (déjà couvertes en partie par FR-4) et une durée de conservation définie (voir §8, Prérequis avant lancement public).
- Le Children's Code (Age Appropriate Design Code) de l'ICO s'applique à tout service numérique susceptible d'être utilisé par des mineurs, y compris un projet élève informel — à faire vérifier avant un lancement élargi (voir §8, Prérequis avant lancement public). `[NOTE FOR PM]` ce point mérite un avis extérieur (juridique ou lycée) avant présentation officielle, pas seulement une lecture rapide de ce PRD.

## 11. Exigences non-fonctionnelles transverses

- **Simplicité de maintenance** : toute décision technique doit rester constructible et maintenable par une équipe de deux développeurs débutants sans accompagnement soutenu — principe directeur hérité du brief, applicable à chaque FR de ce document.
- **Disponibilité** : le chat doit rester accessible en continu (l'urgence ne suit pas les heures de cours), même si la réponse humaine, elle, ne l'est pas.
- ~~**Résilience du filet de sécurité** : FR-8 (bandeau permanent) ne doit jamais dépendre de FR-9 (détection) pour fonctionner — si la détection automatique tombe en panne, le bandeau reste visible.~~ `[RETIRÉ, 2026-07-10]` Sans objet depuis le retrait de FR-8 (rien n'est plus affiché à l'Élève, avec ou sans détection). Conservée ici, barrée, pour traçabilité — ne pas réintroduire cette exigence sans réintroduire FR-8 lui-même.
