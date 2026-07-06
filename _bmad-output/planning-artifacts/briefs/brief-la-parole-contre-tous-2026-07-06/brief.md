---
title: "La Parole Avant Tout — Chat Anonyme"
status: draft
created: 2026-07-06
updated: 2026-07-06
---

# Brief produit : La Parole Avant Tout — Chat Anonyme

## Résumé exécutif

La Parole Avant Tout est un site créé par deux élèves du Lycée Français Charles de Gaulle de Londres pour offrir aux élèves victimes de harcèlement scolaire un espace de parole solidaire, sûr et bienveillant. Le site existe déjà (sur Wix) et promet une "Discussion Anonyme" — mais cette promesse n'a aujourd'hui aucun chat fonctionnel derrière elle.

Ce brief cadre la construction de ce chat anonyme : un espace où un élève peut écrire librement, sans révéler son identité, et recevoir une réponse de la part des deux organisateurs — qui sont eux-mêmes des élèves du lycée, pas des adultes. C'est ce principe de pair-à-pair qui crée la proximité et la confiance nécessaires pour que quelqu'un se livre. Le chat vivra sur une nouvelle brique technique séparée de Wix (nom de domaine et hébergement dédiés), pensée pour rester simple à construire et à maintenir par une équipe de deux débutants.

L'enjeu n'est pas seulement technique : un élève peut un jour écrire des idées noires. Le projet doit donc conjuguer deux exigences en tension — l'anonymat qui met les élèves en confiance, et la possibilité d'agir vite si quelqu'un est en danger — sans jamais faire porter cette responsabilité aux organisateurs seuls face à l'urgence.

## Le problème

Le harcèlement et l'exclusion à l'école ont deux visages, pas un seul :

- Des élèves subissent du harcèlement scolaire et n'ont pas toujours un moyen simple, sûr et rapide de s'exprimer sans crainte d'être identifiés — que ce soit par peur du jugement, des représailles, ou simplement par gêne à en parler à un adulte de front.
- À l'inverse, un élève exclu ou marginalisé cherche parfois à se lier d'amitié avec un camarade qui, lui, n'a pas forcément envie de s'investir dans cette relation. Ce camarade se retrouve démuni : il veut bien faire, sans savoir comment poser une limite saine sans simplement rejeter la personne. C'est aussi une forme de mal-être scolaire qui mérite une réponse — pas seulement celle de la victime directe.

Le site "La Parole Avant Tout" a été pensé pour répondre à ces deux réalités, mais sa fonctionnalité centrale — un espace de discussion anonyme — n'existe pas encore concrètement : la page en parle, sans qu'aucune conversation ne puisse réellement avoir lieu.

Sans ce chat, la promesse du site ("s'exprimer est le premier pas vers le changement") reste un slogan sans mécanisme pour la tenir.

## La solution

Un chat anonyme intégré au nouveau site, ouvert aux deux profils décrits ci-dessus — celui qui subit et celui qui cherche comment bien réagir face à un camarade exclu — où :

- un élève peut écrire un message sans créer de compte ni révéler son identité ;
- l'élève reçoit un accusé de réception automatique (assisté par IA) dès l'envoi de son message, avec une attente honnête ("bien reçu, on te répond dès qu'on peut") plutôt qu'une promesse de vitesse intenable — les organisateurs étant eux-mêmes en cours une bonne partie de la journée ;
- les deux organisateurs sont notifiés quasiment instantanément d'un nouveau message et peuvent répondre depuis une interface qui leur est propre ;
- seuls les deux organisateurs (authentifiés) peuvent consulter les conversations — personne d'autre n'y a accès (voir Protocole de sécurité ci-dessous) ;
- si un message laisse penser à un danger sérieux pour l'élève (idées noires), le chat affiche systématiquement les numéros d'urgence pertinents, et les organisateurs suivent un protocole d'escalade humain (voir ci-dessous) plutôt que de gérer seuls la situation.

Le canal de notification (WhatsApp, email, ou autre) n'est pas figé dans ce brief : ce qui compte est la rapidité et la fiabilité de la notification, pas le support technique précis. Ce choix revient à la phase d'architecture, avec un principe directeur : privilégier la solution la plus simple à mettre en place et à maintenir pour une équipe de deux débutants (voir Addendum pour les options déjà évoquées).

## Protocole de sécurité et gestion de crise

C'est la pièce centrale du produit, pas un détail de conformité :

- **Accès restreint** : seuls Charles et son binôme peuvent lire les conversations, via authentification. Aucun tiers, y compris la CPE ou la counsellor, n'a d'accès direct au système.
- **Filet de sécurité humain** : la CPE et la counsellor du lycée ont déjà été consultées et ont accepté d'être jointes par téléphone si les organisateurs font face à une situation de danger (idées noires) qui les dépasse. `[HYPOTHÈSE]` cet accord est pour l'instant oral — à reconfirmer formellement avant le lancement public, notamment sur la disponibilité réelle en dehors des heures de cours (le chat étant accessible en continu).
- **Filet de sécurité automatique** : tout message signalé comme à risque affiche systématiquement à l'élève les numéros d'urgence appropriés (Royaume-Uni), indépendamment de la rapidité de réponse des organisateurs.
- **Responsabilité assumée** : les deux organisateurs choisissent, en connaissance de cause, de porter la responsabilité de premier niveau — ce n'est pas un oubli, c'est un choix explicite documenté ici.

## Qui ça sert

**Utilisateurs principaux** — les élèves du Lycée Français Charles de Gaulle de Londres, sous deux formes :
- ceux confrontés au harcèlement scolaire ou à l'exclusion, qui cherchent un espace pour s'exprimer sans crainte d'être exposés ;
- ceux qui font face à la demande d'amitié d'un camarade exclu et cherchent comment y répondre avec respect, sans se sentir obligés d'accepter une relation qu'ils ne souhaitent pas.

**Organisateurs** — Charles et son binôme, deux élèves, niveau débutant en développement, qui répondent aux messages et portent la responsabilité de premier niveau des échanges.

**Soutien ponctuel** — la CPE et la counsellor du lycée, joignables par téléphone en cas de signal de danger, sans accès direct au système.

## Périmètre

**Dans ce brief :**
- Chat anonyme fonctionnel, hébergé sur une brique séparée (domaine + serveur dédiés).
- Interface organisateurs : authentification, consultation des conversations, réponse.
- Notification rapide aux organisateurs à réception d'un message.
- Affichage automatique des numéros d'urgence sur signal de danger détecté.
- Réorganisation/clarification de l'interface du site autour de cette fonctionnalité.
- Mise en avant, ailleurs sur le site (au-delà du seul chat), du deuxième volet du problème : comment bien réagir face à un camarade exclu qui cherche l'amitié, en respectant ses propres limites.

**Hors périmètre (pour l'instant) :**
- Le canal exact de notification (WhatsApp ou autre) — décision différée à l'architecture.
- Podcasts et articles — bonne idée, mais traitée dans un brief séparé.
- Adoption officielle par le lycée — l'objectif immédiat est de pouvoir leur présenter un produit qui fonctionne, pas d'attendre leur feu vert pour le construire.
- Accès direct de la CPE/counsellor au système — reste un contact téléphonique hors-système pour cette version.

## Critères de succès

- Un élève reçoit systématiquement un accusé de réception immédiat et automatique de son message, puis une réponse humaine d'un organisateur dans un délai honnêtement annoncé (ex : sous la journée), plutôt qu'une promesse de rapidité que deux lycéens en cours ne peuvent pas tenir.
- Aucune fuite d'identité d'élève en dehors des deux organisateurs authentifiés.
- Un message à risque déclenche systématiquement l'affichage des numéros d'urgence, sans exception.
- Le lycée (CPE, direction) peut voir, lors de la présentation, un outil déjà fonctionnel et une réponse claire à "que se passe-t-il en cas d'urgence ?".

## Vision

Si ça marche, "La Parole Avant Tout" devient l'endroit de référence où les élèves du lycée savent qu'ils peuvent parler sans crainte — au point que le lycée l'adopte et le soutient officiellement, avec un adulte référent formellement intégré au protocole de crise plutôt qu'un simple contact téléphonique. Les podcasts et articles pourraient alors élargir le site en une vraie plateforme de sensibilisation, au-delà du seul canal de discussion.
