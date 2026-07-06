---
title: "Revue adversariale — Protocole de détection de danger et d'escalade de crise"
scope: "PRD La Parole Avant Tout — §4.5, §4.6, §7 (SM-2), §9, garde-fous sécurité"
date: 2026-07-06
status: draft
---

# Revue adversariale du protocole de détection de danger et d'escalade

**Périmètre de cette revue** : uniquement le protocole de sécurité crise (§4.5 détection, §4.6 escalade, §7 SM-2, §9 hypothèses, garde-fous sécurité/conformité en fin de document). Aucun autre volet du PRD n'est challengé ici.

**Verdict global** : le document est honnête sur ses propres limites (faux négatifs, statut oral de l'accord CPE, absence de supervision adulte) mais cette honnêteté ne compense pas une contradiction structurelle non résolue : le produit promet une "escalade humaine vers la CPE" en cas de danger réel, alors que sa conception (anonymat total, aucune donnée identifiante, §5 Non-Goals) rend cette escalade techniquement inopérante au moment précis où elle serait vitale. Les autres trous (nuit/hors disponibilité, charge mentale des organisateurs-mineurs, statut de la procédure d'escalade "hors système") aggravent ce problème central plutôt que de le compenser.

---

## Finding 1 — L'escalade humaine vers la CPE est structurellement inapplicable à un vrai signal de danger, car le produit interdit toute donnée identifiante

**Sévérité : CRITIQUE**

**Citations :**
- §5, Non-Goals : *"Le produit ne construit pas de compte utilisateur ni d'identité persistante pour les Élèves — l'anonymat est la fonctionnalité, pas un mode dégradé."*
- FR-1, conséquences : *"Aucun champ obligatoire du formulaire ne demande nom, email, ou identifiant scolaire."* *"Le message envoyé est associé à une Session anonyme, jamais à une identité réelle."*
- Garde-fous, Sécurité et confidentialité : *"l'Élève doit être informé dès la première interaction que l'anonymat est la règle, sauf en cas de Signal de danger sérieux où le filet de sécurité (numéros d'urgence + escalade humaine) prend le relais — pratique alignée sur les standards du secteur (Crisis Text Line, Childline UK)."*
- §4.6 : *"les Organisateurs contactent par téléphone la CPE ou la counsellor du lycée."*

**Faille concrète :** la phrase "le filet de sécurité... prend le relais" laisse entendre que l'anonymat cède la place à une action concrète en cas de danger. Mais rien dans le PRD ne décrit *comment* un Organisateur pourrait donner à la CPE une information exploitable sur *qui* est en danger, puisque FR-1 interdit explicitement de collecter nom, email ou identifiant scolaire, et que la Session anonyme est "liée à un navigateur/appareil, pas à une identité" (§3, Glossaire). Concrètement : un élève écrit un message avec idées suicidaires, FR-9/FR-10 s'exécutent, l'Organisateur voit la conversation marquée prioritaire — et n'a **aucun moyen** de dire à la CPE de qui il s'agit, à moins que l'élève ne se soit spontanément identifié dans le texte du message lui-même (ce qui n'est ni requis, ni même incité par le produit). L'"escalade" se réduit alors à : appeler la CPE pour dire "un élève anonyme a écrit quelque chose d'inquiétant, je ne sais pas qui" — une action qui ne permet aucune intervention réelle (pas de vérification du bien-être, pas de contact avec la famille, pas d'intervention physique).

La comparaison à "Crisis Text Line, Childline UK" (garde-fous, ligne citée) est trompeuse à cet égard : ces services opèrent par téléphone/SMS, où le numéro appelant permet une identification ou une localisation d'urgence en dernier recours (triangulation, callback). Ce PRD reproduit le vocabulaire de ces standards ("le filet de sécurité prend le relais") sans reproduire le mécanisme qui les rend réellement actionnables. Le PRD ne pose jamais explicitement cette question : "quand l'anonymat *doit* céder, comment ?" — ni dans §4.5, ni §4.6, ni §8 (Questions ouvertes), ni §9 (Index des hypothèses).

**Suggestion de correction :** trancher explicitement, avant tout lancement, l'un des trois scénarios suivants (et le documenter comme FR testable, pas comme prose de vision) :
1. Le produit ne peut *jamais* identifier un élève, et l'escalade "CPE" en cas de Signal de danger consiste uniquement à masser les ressources d'urgence *publiques* (Samaritans, Childline, 999) affichées à l'élève lui-même (FR-8/FR-10) — sans intervention institutionnelle possible tant que l'élève ne se dévoile pas. Dans ce cas, retirer ou reformuler la mention "escalade humaine" comme si elle apportait une protection supplémentaire réelle en cas de danger vital non consenti par l'élève.
2. Prévoir un mécanisme *optionnel et explicite* où l'Organisateur peut, avec ou sans consentement de l'élève selon la gravité, demander une information a minima (ex. prénom, classe) dans les échanges suivants — ce qui contredit alors le Non-Goal actuel et doit être assumé comme tel.
3. Documenter noir sur blanc, dans la procédure d'escalade (FR-11) et dans le message de disclaimer à l'élève, que "en cas de danger vital, nous ne pouvons intervenir concrètement que si tu choisis de nous dire qui tu es" — ce qui change la promesse faite à l'élève dès la première interaction.

---

## Finding 2 — Angle mort nocturne / hors disponibilité : le "filet humain" n'existe pas dans les heures où il est le plus nécessaire

**Sévérité : CRITIQUE**

**Citations :**
- UJ-4, cas limite : *"un message peut évoquer un danger sans utiliser les mots-clés attendus (faux négatif) — c'est pourquoi le filet humain (l'organisateur qui lit) reste la deuxième ligne de défense, jamais remplacée par la détection automatique."*
- FR-10, NFR : *"Faux négatifs... atténués par le fait que les Organisateurs lisent tout de même chaque message humainement."*
- FR-7 : *"Un Organisateur est notifié dans un délai court (cible : quelques minutes maximum)."*
- SM-3 : *"Délai médian de première réponse humaine à un message sous 24h."*
- UJ-1, État d'entrée / UJ-4 : messages envoyés *"en dehors des heures de cours"*, *"un soir."*

**Faille concrète :** le PRD identifie lui-même que le mot-clé peut rater un vrai signal (faux négatif), et présente la lecture humaine comme le filet de rattrapage. Mais ce filet humain a une SLA cible de "quelques minutes" pour la simple *notification* (FR-7, non garantie, juste une cible), et un **délai médian de 24h** pour la *réponse* (SM-3) — un mot choisi qui signifie que la moitié des cas dépassent 24h. Les scénarios d'usage eux-mêmes (UJ-1, UJ-4) placent le message précisément le soir, en dehors des heures de cours, quand les deux seuls Organisateurs — des lycéens avec cours, sommeil, examens, vie sociale — ne sont structurellement pas en train de surveiller leur téléphone. Il n'existe :
- aucune SLA plancher (pire cas / p95) pour un message qui *ressemble* à de la détresse sans matcher les mots-clés ;
- aucun mécanisme de relance/escalade automatique si la notification n'est pas acquittée dans un délai donné (ex. relance après 30 min sans lecture) ;
- aucune redondance de canal de notification (FR-7 renvoie tout au choix d'architecture, mais rien n'impose une double notification en cas de non-réponse) ;
- aucune distinction dans SM-3 entre "réponse ordinaire" et "réponse à un message qui, sans avoir déclenché FR-9, ressemble à une détresse" — la seule vigilance disponible pour ce cas est la lecture standard, avec un délai cible de... 24h médian.

Concrètement : un message de nuit qui ne contient pas les mots-clés attendus mais exprime une réelle détresse peut rester sans aucune réaction humaine pendant des heures, potentiellement jusqu'au lendemain après-midi (si le délai médian est 24h, une partie significative des cas dépasse ce chiffre). Le bandeau permanent (FR-8) reste affiché mais n'est pas *poussé* vers l'élève — un élève qui n'a pas cherché à signaler un danger (car il ne se perçoit pas nécessairement comme "en danger" au sens des mots-clés) n'a aucune raison de cliquer dessus.

**Suggestion de correction :** définir une SLA explicite "pire cas" (pas seulement médiane) pour toute conversation non répondue passé un seuil (ex. 4h), avec relance automatique multi-canal des deux Organisateurs ; envisager un troisième contact de secours (adulte référent joignable la nuit) pour les cas où aucun des deux Organisateurs ne répond dans une fenêtre critique — actuellement absent de FR-4/FR-7/§4.6.

---

## Finding 3 — FR-11 : le renvoi "hors du système" est légitime en théorie, mais le PRD le traite comme livré alors que son contenu réel n'existe pas

**Sévérité : HAUTE**

**Citations :**
- FR-11 : *"Les Organisateurs disposent d'une procédure claire et écrite (hors du système)... `[ASSUMPTION]` cette procédure est un document/checklist externe au produit logiciel."*
- FR-11, Notes : *"l'accord de la CPE/counsellor est aujourd'hui oral (brief, Protocole de sécurité). Le confirmer formellement... est un prérequis avant tout lancement public — voir §8."*
- §6.1, Périmètre MVP (dans le périmètre) : *"Procédure d'escalade humaine documentée vers la CPE/counsellor — §4.6."*
- §8, Question ouverte 2 : *"Confirmation formelle (écrite) de la disponibilité de la CPE/counsellor pour l'escalade, y compris en dehors des heures de cours... actuellement un accord oral seulement."*

**Faille concrète :** renvoyer la procédure d'escalade à un document externe n'est pas en soi un trou de sécurité — c'est un choix d'échelle raisonnable pour un PRD produit. Le vrai problème est ailleurs : §6.1 liste "Procédure d'escalade humaine documentée vers la CPE/counsellor" comme **dans le périmètre MVP**, c'est-à-dire comme un livrable considéré comme fait/livrable à ce stade, alors que la Note pour PM sous FR-11 dit explicitement que l'accord sous-jacent n'est qu'oral et que sa confirmation écrite est un "prérequis avant tout lancement public." Aucune exigence testable, aucun critère de succès (SM-1 à SM-5) ne bloque effectivement le lancement tant que cette confirmation n'existe pas. SM-5 ("le lycée... peut constater un outil fonctionnel et obtenir une réponse claire à 'que se passe-t-il en cas d'urgence ?'") valide FR-11, mais rien n'empêche de cocher SM-5 avec une procédure reposant sur un accord oral non vérifié — y compris sur la disponibilité *hors heures de cours*, alors que le chat lui-même est *"accessible en continu"* (Exigences non-fonctionnelles transverses, §disponibilité). Autrement dit : le produit est conçu pour recevoir des signaux de danger 24/7, mais le seul palier d'escalade au-delà des deux organisateurs-mineurs n'a, à ce jour, aucune garantie de disponibilité 24/7 — et rien dans le document n'interdit de lancer avant que cette garantie existe.

**Suggestion de correction :** transformer la Question ouverte §8.2 en gate de lancement explicite (pas seulement une question) : aucun déploiement public tant que (a) l'accord CPE/counsellor est confirmé par écrit, ET (b) sa disponibilité hors heures de cours est explicitement définie (avec un plan B écrit si elle n'est pas joignable). Retirer "Procédure d'escalade humaine documentée" de §6.1 tant que ces deux conditions ne sont pas remplies, ou reformuler l'item pour refléter son état réel ("ébauche non confirmée").

---

## Finding 4 — Aucune prise en compte de la charge et de la disponibilité des deux organisateurs-mineurs eux-mêmes

**Sévérité : HAUTE**

**Citations :**
- §3, Glossaire : *"Organisateur — Charles ou son binôme, les deux seules personnes authentifiées pouvant consulter et répondre aux conversations."*
- FR-4 : *"Seuls deux comptes existent (un par Organisateur) — pas de création de compte en libre-service."*
- FR-7 : *"le délai... reçue par au moins un Organisateur est mesurable."*
- Garde-fous : *"Responsabilité assumée : les Organisateurs portent explicitement la responsabilité de premier niveau des échanges, en connaissance de cause."*

**Faille concrète :** le système repose sur exactement deux comptes, sans mécanisme de secours si l'un des deux est absent (maladie, examens, vacances, voyage scolaire) ou si les deux le sont simultanément — FR-7 ne garantit que "au moins un," ce qui suppose implicitement que l'autre reste toujours joignable, hypothèse non vérifiée nulle part dans le document. Plus grave : rien n'anticipe le cas où **l'organisateur disponible est lui-même dépassé** par le contenu d'un message de crise — un lycéen mineur qui lit seul, potentiellement tard le soir, un message évoquant des idées suicidaires, et qui doit décider seul s'il "dépasse ce qu'il peut gérer" (§4.6 : *"Face à un Signal de danger qui dépasse ce que les Organisateurs peuvent gérer seuls..."*). Le protocole présuppose un jugement clair et une capacité émotionnelle stable chez un mineur confronté à la détresse d'un autre mineur, sans aucune ressource de soutien pour l'Organisateur lui-même (pas de débrief, pas d'adulte référent pour l'Organisateur en tant que personne exposée, pas de règle du double-regard obligatoire sur les signaux graves). La phrase "responsabilité assumée en connaissance de cause" traite ce risque comme du ressort du brief, mais aucune garde-fou opérationnel ne protège concrètement l'Organisateur qui craque après lecture d'un message grave à 23h, seul.

**Suggestion de correction :** ajouter un FR ou une exigence de procédure imposant, pour tout Signal de danger avéré (pas seulement suspecté), une notification simultanée aux *deux* Organisateurs (jamais un seul face à la décision), et documenter un contact de soutien pour les Organisateurs eux-mêmes (adulte référent qu'ils peuvent solliciter pour leur propre charge mentale, distinct du canal CPE pour l'élève).

---

## Finding 5 — La limite de confidentialité n'est jamais codifiée comme exigence testable, seulement décrite en prose narrative

**Sévérité : HAUTE**

**Citations :**
- Garde-fous, Sécurité et confidentialité : *"l'Élève doit être informé dès la première interaction que l'anonymat est la règle, sauf en cas de Signal de danger sérieux..."*
- UJ-1, Parcours : *"elle ouvre la page de chat → lit un texte court expliquant l'anonymat et ses limites... → écrit son message → l'envoie."*
- FR-1, Conséquences (testables) : *"Aucun champ obligatoire du formulaire ne demande nom, email, ou identifiant scolaire."* (aucune mention de la disclosure de confidentialité)

**Faille concrète :** l'exigence d'informer l'élève *avant* qu'il écrive n'existe que dans le récit UJ-1 (un parcours narratif, pas une exigence testable) et dans une phrase de la section Garde-fous (prose, pas un FR numéroté). Contrairement à FR-3 (accusé de réception, avec conséquences testables et un seuil de temps < 2s) ou FR-8 (bandeau permanent, avec conséquence testable "visible sur chaque écran"), il n'existe **aucun FR dédié** avec des conséquences testables du type "le texte explicatif de la limite de confidentialité s'affiche et doit être vu/accepté avant que le champ de saisie du premier message soit actif." Rien n'empêche une implémentation où ce texte est relégué en petit, en bas de page, ou accessible seulement via un lien "en savoir plus" jamais consulté — ce qui viole en pratique la promesse de la Vision (§1) et des Garde-fous sans qu'aucun test d'acceptation du PRD ne le détecte. Ordre chronologique non garanti : rien n'assure que l'information arrive *avant* l'écriture plutôt qu'après-coup, seulement au moment où le Signal se déclenche (ce qui serait trop tard pour un consentement éclairé).

**Suggestion de correction :** créer un FR dédié (ex. FR-1bis) avec conséquences testables : "le texte sur la limite de confidentialité (anonymat sauf Signal de danger) est visible avant l'activation du champ de saisie du premier message de la session" et "l'élève ne peut pas envoyer de message sans qu'un accusé visuel de cette information ait été affiché en premier écran." Cela sécurise l'ordre chronologique exigé par un consentement éclairé, particulièrement pertinent au regard du Children's Code cité en fin de PRD.

---

## Finding 6 — SM-2 est une métrique tautologique : elle ne mesure jamais l'efficacité réelle de la détection, seulement le câblage mécanique FR-9→FR-10

**Sévérité : MOYENNE-HAUTE**

**Citations :**
- SM-2 : *"100 % des messages détectés comme Signal de danger déclenchent l'affichage des numéros d'urgence, sans exception. Valide FR-9, FR-10."*
- SM-C1 : *"Le taux de faux positifs de la détection de Signal de danger (FR-9) ne doit pas être optimisé à la baisse au prix de rater de vrais signaux."*

**Faille concrète :** SM-2 mesure que *tout message déjà détecté* déclenche bien l'affichage — un test de câblage logiciel (si FR-9 matche, FR-10 s'exécute), quasi garanti par construction si le code est correct. Ce n'est **pas** une mesure de rappel (recall) de la détection elle-même : le PRD ne définit aucun indicateur de "combien de vrais signaux de danger n'ont pas été détectés" (faux négatifs), alors que c'est précisément le risque que le document reconnaît comme le plus grave (UJ-4, cas limite ; FR-10 NFR). SM-C1 mentionne le compromis faux positifs/négatifs en langage qualitatif ("mieux vaut... occasionnellement... qu'un vrai signal manqué") mais ne s'accompagne d'aucun mécanisme opérationnel pour *savoir* si des signaux sont manqués : pas de processus où un Organisateur, en lisant a posteriori un message qui aurait dû déclencher FR-9 mais ne l'a pas fait, remonte ce cas pour enrichir la liste de mots-clés (FR-9, révisable). Sans cette boucle de rétroaction, la liste de mots-clés ne s'améliore jamais après un raté réel, et l'équipe n'a aucune visibilité chiffrée sur sa propre principale zone de risque.

**Suggestion de correction :** ajouter une métrique complémentaire à SM-2, ex. "SM-2bis : nombre de messages signalés a posteriori par un Organisateur comme 'aurait dû déclencher FR-9 mais ne l'a pas fait', revu mensuellement pour mise à jour de la liste de mots-clés" — et un FR imposant aux Organisateurs un moyen simple de marquer un message comme faux négatif rétroactif.

---

## Finding 7 — Les deux organisateurs-mineurs sont positionnés comme responsables de fait du traitement de données de santé sensibles, sans que leur capacité légale à assumer ce rôle soit interrogée

**Sévérité : MOYENNE**

**Citations :**
- Garde-fous, Responsabilité assumée : *"les Organisateurs portent explicitement la responsabilité de premier niveau des échanges, en connaissance de cause (choix documenté dans le brief)."*
- Conformité : *"Les messages évoquant la santé mentale ou des idées suicidaires constituent une catégorie de données sensible au sens du UK GDPR... Statut légal du projet vis-à-vis du lycée... détermine qui est responsable du traitement des données au sens du UK GDPR / Children's Code."* (§8.4)
- §8.3 : *"Durée de conservation des Conversations et politique de suppression — non tranchée."*

**Faille concrète :** le document assume, comme un fait acquis ("en connaissance de cause"), que deux lycéens mineurs peuvent porter "la responsabilité de premier niveau" d'échanges relevant de données de santé sensibles au sens du UK GDPR, tout en indiquant dans la même respiration que le statut légal (qui est le "responsable du traitement") reste une question ouverte non tranchée (§8.4) et que la durée de conservation n'est pas fixée (§8.3). Il n'y a nulle part une vérification que des mineurs peuvent, légalement ou raisonnablement, endosser ce niveau de responsabilité (exposition à une plainte, une fuite de données, un signalement raté) sans qu'un adulte ou une structure ne porte in fine la responsabilité juridique. Le risque n'est pas seulement pour l'élève qui écrit, mais pour Charles et son binôme eux-mêmes, qui pourraient se retrouver exposés (moralement, voire légalement) à une situation qu'ils n'ont pas la capacité de gérer — exactement le risque que la mission de cette revue demande de challenger.

**Suggestion de correction :** ne pas traiter §8.4 comme une simple question ouverte parmi d'autres — en faire un prérequis bloquant de lancement au même titre que suggéré au Finding 3, avec clarification explicite (avis extérieur) sur qui porte réellement la responsabilité légale, avant que les deux mineurs ne soient de facto exposés en présentant/lançant l'outil.

---

## Finding 8 — La liste des numéros d'urgence elle-même n'est pas validée à ce stade, alors que FR-8/FR-10 en dépendent entièrement

**Sévérité : BASSE**

**Citations :**
- Addendum : *"UK : Samaritans 116 123, Childline 0800 1111, urgences 999/111 — liste exacte à confirmer/valider en architecture, ne pas la considérer figée depuis cette recherche."*
- FR-8 : *"le bandeau/lien vers les numéros d'urgence est visible sur chaque écran du chat."*

**Faille concrète :** point mineur mais réel — l'ensemble du filet automatique (FR-8, FR-10, SM-2) repose sur une liste de numéros que le document lui-même qualifie de non figée/non validée. Ce n'est pas bloquant pour le PRD (relève de l'architecture) mais mérite d'être explicitement listé comme prérequis de lancement, pas seulement mentionné en aparté dans l'addendum.

**Suggestion de correction :** ajouter cette validation à la liste des prérequis de lancement (à côté de la confirmation CPE, Finding 3).

---

## Synthèse des sévérités

| # | Titre | Sévérité |
|---|-------|----------|
| 1 | Escalade CPE inopérante sans identité (contradiction anonymat/sécurité) | Critique |
| 2 | Angle mort nocturne / hors disponibilité des organisateurs | Critique |
| 3 | FR-11 traité comme livré alors que l'accord CPE est oral et non gaté au lancement | Haute |
| 4 | Aucune prise en compte de la charge/disponibilité des organisateurs-mineurs | Haute |
| 5 | Disclosure de confidentialité non codifiée comme exigence testable | Haute |
| 6 | SM-2 tautologique, aucune mesure de rappel réel / boucle de rétroaction | Moyenne-Haute |
| 7 | Responsabilité légale de fait imposée à des mineurs sans validation de capacité | Moyenne |
| 8 | Liste de numéros d'urgence non validée | Basse |
