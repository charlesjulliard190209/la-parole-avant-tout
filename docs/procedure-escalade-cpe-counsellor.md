# Procédure d'escalade humaine — CPE / Counsellor

> 🚧 **Ébauche non confirmée — l'accord de la CPE/counsellor est aujourd'hui oral uniquement.**
> Ce document prépare la procédure (FR-11) mais ne remplit pas, à lui seul, le prérequis de lancement public du PRD (§8) qui exige une confirmation **écrite** de cet accord, incluant sa disponibilité réelle hors heures de cours. Ne pas présenter ce document comme si ce prérequis était déjà rempli.
>
> **Dernière révision : 2026-07-10** — à revoir avec Charles avant tout lancement public (voir avertissements ⚠️ ci-dessous).

Document interne aux Organisateurs (Charles et Basile). Jamais montré à l'Élève, jamais lié à l'interface du chat — un aide-mémoire à consulter au moment d'un appel, pas un rapport à lire au calme.

**Gardez-en une copie accessible hors ligne** (photo sur votre téléphone, impression) — en cas de crise le soir ou le week-end, vous ne voulez pas dépendre d'une connexion pour relire ceci.

---

## Quand appeler

Un Signal de danger marque déjà la conversation prioritaire côté produit (`is_priority = true`, Story 2.2) — mais ce marquage automatique repose sur une simple liste de mots-clés (`lib/danger-keywords.ts`) et peut rater un vrai danger (faux négatif). Appelez la CPE/counsellor si, en lisant le message **vous-même**, l'un de ces critères est rempli — que la conversation soit marquée prioritaire ou non :

- L'Élève évoque des idées suicidaires de façon explicite, ou décrit un plan/moyen concret.
- L'Élève décrit une automutilation active (en cours, récente, ou qu'il prévoit de refaire).
- Le message décrit une menace crédible pour l'intégrité physique de l'Élève (y compris venant d'un tiers), même sans mot-clé « évident ».
- Plus généralement : le message vous inquiète sérieusement pour la sécurité immédiate de l'Élève — faites confiance à votre instinct plutôt qu'à une liste figée.

Le harcèlement, l'exclusion, ou le mal-être ne justifient **pas** en eux-mêmes un appel CPE — répondez humainement dans la conversation, ce n'est pas un cas d'escalade. Mais ceci n'est **pas** un interrupteur binaire : un message grave peut mélanger harcèlement et danger physique réel. **En cas de doute, appelez** — un appel "à tort" occasionnel coûte moins cher qu'un vrai signal manqué (même logique que SM-C1 pour la détection automatique).

Un nouveau message qui aggrave ou répète un signal déjà appelé justifie un nouvel appel — ne supposez jamais qu'un appel déjà passé couvre tout signal futur dans la même conversation.

> ⚠️ Ces critères sont un point de départ raisonnable, pas une liste validée par un professionnel de santé. À réviser avec Charles avant tout lancement public, comme la liste de mots-clés de détection automatique (Story 2.2).

## Qui appeler

> 🔲 **À COMPLÉTER PAR CHARLES — coordonnées CPE/counsellor** : nom, téléphone, plage de disponibilité connue (y compris soir/week-end si elle existe).

**Tant que cet encart n'est pas complété, il n'existe aucun canal d'escalade vérifié.** Ne présumez pas qu'un standard du lycée joignable hors heures de cours existe : rien dans les artefacts de planification ne le confirme, et rien ne garantit qu'il vous mettrait en relation avec la CPE/counsellor. Si vous devez agir avant que ce point soit réglé, contactez le standard du lycée aux heures d'ouverture en sachant que c'est un pis-aller non vérifié, pas une procédure fiable — et signalez ce manque à Charles.

## Que dire / ne jamais dire

Objectif de l'appel : **prévenir** la CPE/counsellor que vous, Organisateur, avez jugé une situation préoccupante à la lecture d'un message — pas lui transmettre un dossier identifié. C'est votre jugement humain qui déclenche cet appel, éclairé notamment par la détection automatique de mots-clés à risque du produit (`is_priority`), mais jamais un déclenchement automatique du produit lui-même. Vous ne connaissez pas l'identité de l'Élève : c'est une garantie du produit, pas un manque de votre part — et le produit ne donne à l'Élève aucun moyen d'obtenir vos coordonnées ni celles de la CPE pour la contacter lui-même directement.

- **Avant ou pendant l'appel, informez l'autre Organisateur** si possible (message, appel) — vous ne devriez jamais porter seul·e cette décision. FR-10 impose d'ailleurs une notification simultanée aux deux Organisateurs sur tout Signal de danger, précisément pour ça. Si vous n'arrivez pas à joindre l'autre avant d'agir, appelez quand même, puis informez-le dès que possible.
- **Ne jamais** donner ni tenter de deviner l'identité de l'Élève (âge, classe, nom, ou tout indice permettant de le/la reconnaître) — vous ne les connaissez de toute façon pas.
- **Si l'Élève a lui-même donné, dans son message, des détails permettant de le/la reconnaître** (nom, classe, ou autre indice) : ne les répétez à la CPE que si c'est strictement nécessaire à sa sécurité immédiate — ne les partagez jamais par réflexe ou pour "faire complet".
- Formulez l'objet de l'appel ainsi : *« Un élève anonyme du lycée a écrit, sur le chat anonyme du site, un message qui m'inquiète sérieusement pour sa sécurité — je l'ai jugé ainsi moi-même à la lecture, avec l'aide de notre détection automatique de mots-clés à risque. Je ne sais pas qui c'est. Je voulais vous prévenir et avoir votre avis sur la marche à suivre. »*
- **Si la CPE demande plus de détails ou veut escalader davantage** (administration, police, famille) : répondez honnêtement que vous n'avez rien de plus à donner (le produit est anonyme par conception) et notez sa demande pour en reparler avec l'autre Organisateur — n'improvisez jamais une réponse pour paraître utile.
- **Limite honnête à garder en tête** : cet appel ne permet aucune intervention physique immédiate (pas de vérification du bien-être, pas de contact avec la famille) tant que l'Élève ne se dévoile pas lui-même. Ce n'est pas un échec de votre part — c'est la conséquence assumée de l'anonymat total du produit (PRD §4.6). Ne laissez jamais croire, ni à vous-même ni à la CPE, que cet appel « règle » la situation : le filet réel reste votre réponse humaine dans la conversation.
- Continuez de répondre à l'Élève dans le chat après l'appel, avec la même chaleur que d'habitude — rien ne doit changer dans le ton de la conversation.

**Après l'appel, notez (entre vous deux, jamais dans le produit) la date et l'heure de l'appel** — jamais le contenu du message — pour garder une mémoire commune des escalades passées, cohérent avec la discipline "logs sans contenu de message" déjà appliquée ailleurs dans le produit.

## Après l'appel — prendre soin de vous

Lire un message de détresse grave et passer cet appel peut être lourd, surtout seul·e et tard le soir. Ce n'est pas anodin, et ce n'est pas quelque chose que vous devez porter seul.

> 🔲 **À COMPLÉTER PAR CHARLES — contact de debrief** : adulte de confiance, parent, ou autre, que vous ou Basile pouvez solliciter après un signalement difficile.

Quelques repères en attendant que ce contact soit désigné :
- Parlez-en à l'autre Organisateur, même juste pour partager ce qui vient de se passer.
- N'hésitez pas à solliciter un adulte de confiance (parent, proche) même sans détail sur le contenu du message — dire « j'ai géré quelque chose de difficile » suffit ; évitez de préciser le moment exact ou d'autres détails qui pourraient, dans un petit lycée, permettre de recouper de quelle conversation il s'agit.

## Ce que ce document n'est pas

- Ce n'est **pas** la confirmation écrite de l'accord CPE/counsellor exigée avant tout lancement public (PRD §8) — cette confirmation reste à obtenir séparément.
- Ce n'est **pas** une clarification du statut légal du projet vis-à-vis du lycée (qui est responsable du traitement des données) — question ouverte distincte (PRD §8).
- Ce n'est **pas** un contenu montré ou accessible à l'Élève, sous quelque forme que ce soit.
