---
title: "Addendum — La Parole Avant Tout — Chat Anonyme"
status: draft
created: 2026-07-06
updated: 2026-07-06
---

# Addendum

Contenu utile pour la suite (architecture, PRD) mais trop détaillé pour le brief lui-même.

## État du site existant (constaté au 2026-07-06)

- Site Wix : charlesjulliard19.wixsite.com/la-parole-avant-tout
- Trois sections de navigation : Accueil, Discussion Anonyme, Dangers du Harcèlement.
- Ton bienveillant, message clé : "S'exprimer est le premier pas vers le changement".
- La section "Discussion Anonyme" est aujourd'hui uniquement du texte promotionnel ("Notre plateforme offre aux élèves un refuge anonyme et sécurisé pour s'exprimer librement.") — aucun chat ni formulaire fonctionnel derrière.

## Options envisagées pour le canal de notification (à trancher en architecture)

Le brief ne fige pas le canal final ; voici les pistes discutées avec Charles et pourquoi aucune n'a été verrouillée :

1. **Bot WhatsApp Business (Meta Cloud API ou service tiers type Twilio)** — répond à l'envie initiale de Charles (recevoir les messages sur WhatsApp), mais suppose la vérification d'un compte Business Meta, potentiellement des coûts, et la maintenance d'une intégration API — jugé trop lourd pour une équipe de deux débutants sans accompagnement soutenu.
2. **Automatisation no-code (n8n, Make, etc.) reliant le chat web à WhatsApp** — réduit la charge de code mais ajoute un service tiers de plus à gérer et surveiller.
3. **Notification simple (email / push web)** — la plus simple à construire et maintenir avec des compétences débutantes, mais s'éloigne de l'envie initiale d'utiliser WhatsApp pour la rapidité.

Décision actée dans le brief : reformuler l'exigence comme "notification quasi instantanée, canal à définir", pour ne pas enfermer le projet dans une solution technique avant que sa faisabilité pour une équipe débutante soit validée.

## Contexte équipe et contraintes

- Deux personnes, niveau débutant en développement.
- Initiative indépendante des deux élèves, pas encore adoubée officiellement par le lycée — l'objectif est de leur présenter un produit qui fonctionne déjà.
- Lycée Français Charles de Gaulle, Londres (réseau AEFE, Royaume-Uni) — implique le droit britannique de protection des données et des mineurs comme cadre de référence à valider en architecture (pas traité dans ce brief).
- Aucune deadline externe : lancement quand l'équipe se sent prête.
- Qui maintient le serveur et le nom de domaine dans la durée (renouvellement, sécurité, sauvegardes) reste une question ouverte à trancher avant le lancement — probablement Charles et son binôme, avec accompagnement pas à pas si besoin.

## Options envisagées pour l'accès en cas de crise

Trois options ont été mises sur la table pendant la discussion :
- Accès fermé aux deux organisateurs uniquement, avec numéros d'urgence automatiques.
- Organisateurs + adulte référent avec accès limité aux seuls messages marqués "urgents".
- Organisateurs + adulte référent avec accès complet.

Charles a choisi la première option, en confirmant explicitement que lui et son binôme acceptent cette responsabilité, avec un filet humain hors-système (appel téléphonique à la CPE/counsellor) plutôt qu'un accès partagé au système. Cette décision reste réversible si le lycée, une fois le projet présenté, souhaite formaliser un accès pour un adulte référent.

## Podcasts et articles

Mentionnés par Charles comme extension future du site (contenu éditorial), pas encore produits. Volontairement exclus de ce brief car de nature différente (production de contenu vs. outil de sécurité) — sujet pour un brief séparé le moment venu.
