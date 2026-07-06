---
title: "Addendum — PRD La Parole Avant Tout — Chat Anonyme"
status: draft
created: 2026-07-06
updated: 2026-07-06
---

# Addendum

Contenu utile pour la suite (architecture, UX) mais trop détaillé pour le PRD lui-même.

## Panorama de l'existant (recherche de cadrage, 2026-07-06)

### Outils comparables

- **Crisis Text Line** (Text CONNECT to 741741) : chat/texto anonyme 24/7, contre-tour par des volontaires *formés* (60h+ minimum) et supervisés par des professionnels cliniciens. Anonymat garanti sauf danger immédiat pour soi ou autrui — règle de référence dans toute la filière.
- **Childline (UK)** : conseil anonyme et gratuit pour enfants/ados, multi-canal (chat, téléphone), forte mise en avant de la confidentialité et protocole clair de rupture de confidentialité en cas de danger.
- **YouthLine / Teen Lifeline (US)** : lignes "pair-à-pair" pilotées par des ados eux-mêmes, mais toujours adossées à une supervision adulte clinique en temps réel.
- **3018 (France, "Non au harcèlement")** : numéro unique harcèlement scolaire/cyberharcèlement, opéré par l'association e-Enfance, écoutants professionnels (psychologues, juristes).

**Écart structurel à assumer :** tous ces services reposent sur une supervision adulte/professionnelle en cas de risque. "La Parole Avant Tout" fonctionne sans supervision adulte directe sur les messages — c'est un choix documenté (brief, Protocole de sécurité), atténué par l'escalade téléphonique vers la CPE/counsellor, mais une différence structurelle à garder en tête, notamment si le lycée est un jour associé formellement au projet (voir Vision du brief).

### Bonnes pratiques "signaux de danger" en chat texte

- Anonymat par défaut, avec clause de confidentialité limitée annoncée dès le départ.
- Affichage systématique de numéros d'urgence locaux dès qu'un message évoque idées noires/automutilation (UK : Samaritans 116 123, Childline 0800 1111, urgences 999/111 — liste exacte à confirmer/valider en architecture, ne pas la considérer figée depuis cette recherche).
- Protocole humain plutôt qu'automatisé pour la décision d'escalade elle-même — cohérent avec l'approche déjà retenue (FR-11 du PRD : la détection déclenche un affichage automatique de ressources, mais la décision d'appeler la CPE/counsellor reste un jugement humain).
- Canal d'escalade rapide et documenté vers un adulte référent, avec délai maximal cible.

### Contraintes légales UK à surveiller (pas une analyse juridique)

- **UK GDPR / Data Protection Act 2018** : messages évoquant santé mentale/idées suicidaires = données de catégorie spéciale → base légale renforcée, mesures de sécurité accrues, durée de conservation définie.
- **Children's Code / Age Appropriate Design Code (ICO)** : s'applique à tout service numérique susceptible d'être utilisé par des mineurs, même non conçu officiellement pour eux — minimisation des données, privacy by default, pas de profilage, transparence adaptée à l'âge.
- Le statut du projet (initiative élève informelle vs service reconnu par l'établissement) détermine qui est responsable du traitement au sens légal — prérequis de lancement public du PRD (§8, Prérequis avant lancement public), à faire trancher par un avis extérieur avant tout lancement élargi.

Sources consultées : Crisis Text Line (crisistextline.org/topics/bullying), Childline UK (childline.org.uk), APA Monitor sur les lignes pair-à-pair (apa.org/monitor/2023/07/peer-support-crisis-line-teens), MAE sur le 3018 (mae.fr/scolaire/guides/numeros-cyberharcelement), education.gouv.fr (Non au harcèlement), ICO Children's Code (ico.org.uk, introduction et application par âge).

## Décisions reportées du brief (rappel, non renégociées ici)

- Canal de notification (WhatsApp/email/autre) : voir addendum du brief pour les options déjà discutées — décision d'architecture.
- Accès crise : accès fermé aux deux organisateurs + numéros automatiques (option retenue par Charles), réversible si le lycée souhaite formaliser un accès adulte plus tard.
