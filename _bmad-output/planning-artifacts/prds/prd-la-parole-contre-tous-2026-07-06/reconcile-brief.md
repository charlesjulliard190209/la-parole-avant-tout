---
title: "Réconciliation brief → PRD — La Parole Avant Tout — Chat Anonyme"
status: draft
created: 2026-07-06
---

# Réconciliation d'input : brief (+ addendum) → PRD (+ addendum)

Objectif : vérifier qu'aucune idée, décision ou nuance qualitative du brief source n'a été perdue ou silencieusement affaiblie par la mise en forme FR/testable du PRD.

Légende : ✅ couvert · ⚠️ couvert mais affaibli/dilué · ❌ absent (gap)

---

## 1. Résumé exécutif du brief

| Idée du brief | Couverture PRD |
|---|---|
| Site créé par deux élèves du lycée, promesse "Discussion Anonyme" sans chat fonctionnel derrière | ✅ PRD §1 ("la page 'Discussion Anonyme' du site, aujourd'hui une promesse vide") |
| Ton pair-à-pair : les organisateurs sont eux-mêmes des élèves, pas des adultes — source de la confiance | ✅ PRD §1 ("ce sont des pairs qui répondent, pas des adultes, ce qui change concrètement qui ose écrire") — bien repris dans la Vision et dans UJ-2 ("Le binôme de Charles, en pause de dix minutes... tape une réponse brève et bienveillante") |
| Nouvelle brique technique séparée de Wix, pensée pour une équipe de deux débutants | ✅ PRD §0 (principe directeur renvoyé à l'architecture) + NFR "Simplicité de maintenance" |
| Tension centrale : anonymat vs capacité d'agir vite en cas de danger, sans faire porter la responsabilité aux organisateurs seuls | ✅ Bien repris — PRD §1 ("qui ne repose jamais sur la seule vigilance de deux lycéens") et section "Contraintes et garde-fous" ("Filet à deux étages... Responsabilité assumée") |

## 2. Le problème

| Idée du brief | Couverture PRD |
|---|---|
| Deux visages du mal-être : victime de harcèlement / camarade qui ne veut pas s'engager dans une amitié non désirée | ✅ PRD §2.1 (deux JTBD distincts), §4.7/FR-13 |
| "C'est aussi une forme de mal-être scolaire qui mérite une réponse — pas seulement celle de la victime directe" (le brief met les deux profils sur un pied d'égalité) | ⚠️ Affaibli — voir Gap n°2 : aucun parcours utilisateur (UJ) n'est construit pour ce second profil ; seul le profil "victime" (Amara) a un parcours complet (UJ-1, UJ-3, UJ-4) |
| Message clé du site : **"S'exprimer est le premier pas vers le changement"** (cité explicitement dans l'addendum du brief comme le ton/message clé de l'existant) | ❌ Absent — voir Gap n°1. Le PRD parle d'une "promesse vide" à combler mais ne cite jamais le message lui-même. Confirmé par recherche texte : aucune occurrence de "premier pas" ni "changement" dans le PRD ou son addendum. |

## 3. La solution

| Idée du brief | Couverture PRD |
|---|---|
| Écrire sans compte ni identité | ✅ FR-1 |
| Accusé de réception automatique, assisté IA, attente honnête ("bien reçu, on te répond dès qu'on peut") plutôt qu'une promesse de vitesse intenable | ✅ FR-3, glossaire — la formulation exacte du brief est reprise quasi mot pour mot dans le climax de UJ-1 |
| Notification quasi instantanée des organisateurs | ✅ FR-7, §4.4 |
| Accès conversations réservé aux deux organisateurs authentifiés | ✅ FR-4, FR-5 |
| Danger sérieux → numéros d'urgence systématiques + protocole d'escalade humain (pas géré seul) | ✅ FR-8, FR-9, FR-10, FR-11 |
| Canal de notification non figé, renvoyé à l'architecture, principe de simplicité pour équipe débutante | ✅ §0, §4.4 (description), addendum PRD |

## 4. Protocole de sécurité et gestion de crise

| Idée du brief | Couverture PRD |
|---|---|
| Accès restreint aux deux organisateurs, aucun tiers (y compris CPE/counsellor) | ✅ FR-4, §2.2 |
| Filet humain : CPE/counsellor déjà consultées, accord oral à reconfirmer, notamment disponibilité hors heures de cours | ✅ Bien repris — PRD §4.6 (Notes `[NOTE FOR PM]`), §8 Q2, NFR "Disponibilité" |
| Filet automatique : numéros d'urgence UK systématiques | ✅ FR-8, FR-10 |
| Responsabilité assumée explicitement par les organisateurs (choix documenté, pas un oubli) | ✅ Repris quasi littéralement dans "Contraintes et garde-fous" |

## 5. Qui ça sert

| Idée du brief | Couverture PRD |
|---|---|
| Utilisateurs principaux (deux profils) | ✅ §2.1 — mais voir Gap n°2 sur le déséquilibre narratif entre les deux profils |
| Organisateurs : deux élèves débutants, responsabilité de premier niveau | ✅ §2.1, §4.3 |
| Soutien ponctuel CPE/counsellor, joignable téléphone, sans accès système | ✅ §2.2, §4.6 |

## 6. Périmètre

Tous les éléments "dans le brief" et "hors périmètre" sont repris fidèlement en §4-6 du PRD (chat, interface organisateurs, notification, numéros d'urgence, réorganisation du site, canal de notification différé, podcasts/articles exclus, adoption officielle non bloquante, accès direct CPE/counsellor exclu). ✅ Aucun gap significatif ici.

## 7. Critères de succès

Tous les critères du brief sont repris (SM-1 à SM-4), et le PRD va même plus loin en ajoutant des contre-métriques (SM-C1, SM-C2) qui protègent explicitement la qualité humaine de la réponse contre une optimisation excessive de la vitesse — un ajout qui *renforce* l'esprit du brief plutôt que de le diluer. ✅

## 8. Vision (long terme)

| Idée du brief | Couverture PRD |
|---|---|
| Adoption officielle du lycée, adulte référent formellement intégré au protocole de crise, podcasts/articles élargissant la plateforme | ⚠️ Absent du §1 Vision du PRD (qui se concentre sur le MVP) — logique puisque le PRD traite du produit à construire, mais aucun renvoi n'est fait vers cette vision long terme pour contextualiser le caractère *provisoire* des non-goals (voir Gap n°3) |
| **Réversibilité** explicite de la décision d'accès crise ("cette décision reste réversible si le lycée... souhaite formaliser un accès") | ⚠️ Perdue dans le corps du PRD — voir Gap n°3. Le mot "réversible" n'apparaît que dans l'addendum du PRD (récapitulatif des décisions), jamais dans le PRD principal (§5 Non-Goals, §6.2) qui présente l'exclusion d'accès CPE/counsellor comme définitive |

## 9. Addendum du brief

| Idée de l'addendum brief | Couverture PRD |
|---|---|
| État du site Wix existant (3 sections, ton bienveillant, message clé, texte promotionnel actuel) | ✅ Partiellement — le fait qu'il n'y a "aucun chat ni formulaire fonctionnel" est repris (§1, FR-12) ; le message clé lui-même ne l'est pas (cf Gap n°1) |
| 3 options de canal de notification (WhatsApp bot, no-code, email/push) et pourquoi aucune n'est verrouillée | ✅ Référencé (pas dupliqué, conforme à l'usage voulu d'un addendum) — §4.4, §8.6, addendum PRD |
| Contexte équipe : deux débutants, initiative indépendante, **aucune deadline externe** ("lancement quand l'équipe se sent prête") | ❌ Absent — cette nuance de rythme/pression n'est reprise nulle part dans le PRD ; impact faible sur la construction mais utile pour cadrer les attentes de livraison |
| Question ouverte : qui maintient serveur/domaine dans la durée | ✅ PRD §8 Q5 |
| 3 options d'accès en cas de crise, choix de Charles, réversibilité | ⚠️ Le choix est repris (FR-4, §5) mais pas les alternatives ni la réversibilité (cf Gap n°3) |
| Podcasts/articles exclus car "nature différente" (contenu éditorial vs outil de sécurité) | ✅ Exclusion reprise (§5, §6.2) ; la justification exacte n'est pas répétée mais n'est pas nécessaire |

## 10. Addendum du PRD — nuances propres à vérifier

| Idée de l'addendum PRD | Couverture dans le PRD principal |
|---|---|
| "Écart structurel à assumer" : tous les services comparables (Crisis Text Line, Childline, YouthLine, 3018) reposent sur une supervision adulte/clinique en cas de risque ; "La Parole Avant Tout" fonctionne **sans** cette supervision directe — point explicitement signalé comme "à garder en tête" | ❌ Ce risque structurel n'est jamais remonté dans le corps du PRD (ni dans "Contraintes et garde-fous", ni dans §8 Questions ouvertes) — voir Gap n°4. Le PRD principal cite les mêmes organismes uniquement pour dire que la pratique est "alignée sur les standards du secteur", sans mentionner l'écart que l'addendum juge pourtant important |

---

## Gaps les plus importants (classés par ordre d'importance)

1. **Message clé du site perdu ("S'exprimer est le premier pas vers le changement").** L'addendum du brief identifie ce slogan comme le message clé/ton de l'existant, et le brief lui-même bâtit toute sa raison d'être dessus ("sans ce chat, la promesse... reste un slogan sans mécanisme pour la tenir"). Le PRD ne cite jamais ce message — il parle abstraitement d'une "promesse vide" à combler. Un lecteur du PRD seul ne saura jamais quel est le message que le produit doit "tenir", ce qui est risqué pour un document censé cadrer le ton et la voix du produit (UX, rédaction de l'accusé de réception, page d'accueil FR-12).

2. **Déséquilibre narratif entre les deux profils d'élèves.** Le brief place le profil "camarade qui ne veut pas rejeter brutalement un élève exclu" au même niveau que la victime de harcèlement ("mérite une réponse — pas seulement celle de la victime directe"). Le PRD conserve ce profil dans les JTBD (§2.1) et lui dédie FR-13, mais aucun des 4 parcours utilisateurs (UJ-1 à UJ-4) ne le met en scène — tous suivent la victime (Amara) ou le signal de danger. Risque concret : en conception/UX, ce profil pourrait être traité comme secondaire alors que le brief insiste sur sa légitimité propre.

3. **Réversibilité de la décision d'accès crise diluée en exclusion permanente.** Le brief (addendum) présente le choix "accès fermé aux deux organisateurs" comme une décision explicitement réversible si le lycée souhaite formaliser un accès pour un adulte référent. Dans le PRD principal, ce choix est formulé en Non-Goal (§5) et hors-périmètre MVP (§6.2) sans mention de réversibilité — le mot n'apparaît que dans l'addendum du PRD, jamais dans le corps principal qui sert de référence de travail quotidienne. Risque : figer une décision que Charles voulait explicitement garder ouverte.

4. **L'écart structurel "pas de supervision adulte en temps réel" n'est pas remonté au rang de risque produit.** L'addendum du PRD signale lui-même que tous les services comparables (Crisis Text Line, Childline, etc.) s'appuient sur une supervision adulte/clinique en cas de danger, contrairement à "La Parole Avant Tout", et demande explicitement de "garder ça en tête". Ce constat ne remonte nulle part dans le PRD principal (ni Contraintes et garde-fous, ni Questions ouvertes §8) — il reste enterré dans un addendum que l'équipe de dev risque de moins consulter que le PRD lui-même.

5. **Absence de la nuance "pas de deadline externe" du contexte équipe.** L'addendum du brief précise que le lancement se fait "quand l'équipe se sent prête", sans pression externe. Cette information de cadrage (utile pour ne pas sur-presser une équipe de deux débutants) ne réapparaît nulle part dans le PRD. Impact mineur sur la construction du produit, mais utile à la gestion du projet et à la priorisation des questions ouvertes (§8).

## Points bien préservés (à noter positivement)

- La tension centrale anonymat / capacité d'agir vite est fidèlement reprise et même renforcée (Vision §1, "Contraintes et garde-fous", filet à deux étages).
- Le ton pair-à-pair est préservé dans les sections narratives (Vision, parcours UJ), avec la formulation de l'accusé de réception reprise quasi mot pour mot. Nuance : le Glossaire (§3) définit "Organisateur" en termes purement fonctionnels/d'autorisation, sans rappeler qu'il s'agit de pairs élèves — une définition de référence qui gagnerait à porter cette nuance, puisque le Glossaire est le point d'ancrage vocabulaire du document.
- Les critères de succès sont non seulement repris mais enrichis (contre-métriques SM-C1/SM-C2) dans l'esprit du brief.
- Les contraintes légales UK (GDPR, Children's Code) sont bien remontées et même mieux structurées que dans le brief source.
