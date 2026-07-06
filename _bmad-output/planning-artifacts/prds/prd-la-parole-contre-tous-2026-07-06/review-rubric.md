# PRD Quality Review — La Parole Avant Tout — Chat Anonyme

## Verdict global

Ce PRD est solide et rare dans son honnêteté : les compromis (mono-appareil, mots-clés plutôt qu'IA, accès fermé aux deux organisateurs) sont assumés et nommés plutôt que dissimulés, les `[ASSUMPTION]`/`[NOTE FOR PM]`/Questions ouvertes sont placés à de vraies tensions (accord oral de la CPE, statut légal, rétention des données), et chaque FR découle directement d'un UJ nommé qui découle lui-même de la Vision. Les deux points faibles sont mineurs et localisés : un seuil de notification (FR-7) resté sur une formulation floue là où le reste du document est rigoureusement testable, et deux UJ (UJ-2, UJ-4) sans protagoniste nommé qui rompent le standard établi par Amara et Léo. Aucun red flag critique — le document est actionnable en l'état pour l'architecture et l'UX.

## Decision-readiness — strong

Les décisions sont posées comme des décisions, pas des considérations. §4.6 nomme explicitement ce qui est sacrifié dans le choix "accès fermé aux deux Organisateurs plutôt qu'un accès système partagé avec un adulte référent" et le marque `réversible` — c'est un vrai arbitrage avec son prix affiché, pas une phrase d'équilibre creuse. §8 (Questions ouvertes) contient des questions réellement ouvertes plutôt que rhétoriques : Q1 propose même une alternative concrète ("aucune détection automatique, juste le bandeau permanent FR-8") si le coût de maintenance des mots-clés s'avère trop lourd — ce n'est pas une question dont la réponse est déjà donnée dans la phrase suivante. Les `[NOTE FOR PM]` (§4.6 FR-11 Notes ; §Conformité) tombent sur de vraies tensions non résolues (accord oral de la CPE à formaliser ; besoin d'un avis juridique externe sur le Children's Code) plutôt que sur des points de contrôle sans risque.

Aucun red flag du type "tout équilibre tout" détecté : les NFR transverses (§ fin de document) sont hiérarchisées plutôt que génériques (la résilience du filet de sécurité prime explicitement sur le reste).

### Findings
Aucun.

## Substance over theater — strong

Pas de théâtre de personas : 3 profils réels (Amara, le binôme organisateur, Léo), chacun sous la barre des quatre, et chaque UJ pilote directement une ou plusieurs FR (UJ-1 → FR-1/FR-3 ; UJ-4 → FR-9/FR-10). Pas de théâtre d'innovation — le document ne revendique aucune nouveauté et compare honnêtement le produit aux standards du secteur (addendum, "Écart structurel à assumer") en admettant l'absence de supervision adulte clinique en temps réel, un écart qui pourrait être maquillé mais ne l'est pas. Pas de théâtre de NFR : "Simplicité de maintenance", "Disponibilité", "Résilience du filet de sécurité" (fin du PRD) sont spécifiques au contexte (équipe de deux lycéens débutants) et non du copié-collé "scalable/sécurisé/fiable". La Vision (§1) est ancrée dans un établissement nommé, un slogan existant du site ("s'exprimer est le premier pas vers le changement") et un mécanisme concret à deux étages — elle ne pourrait pas être recyclée telle quelle dans un autre PRD.

### Findings
Aucun.

## Strategic coherence — strong

Le PRD a une thèse claire et tenue de bout en bout : la page "Discussion Anonyme", aujourd'hui une promesse vide (§1), doit devenir un mécanisme réel à deux niveaux — proximité de pairs et filet de sécurité qui ne repose jamais sur la seule vigilance de deux lycéens. Chaque bloc de fonctionnalités (§4.1 à §4.7) sert cette thèse sans dérive vers "ce qui est facile en premier" : la détection de danger et le protocole d'escalade sont dans le périmètre MVP au même titre que le chat lui-même (§6.1), pas relégués en v2. Les Success Metrics (§7) valident la thèse et non l'activité : SM-2 (100% des signaux de danger déclenchent l'affichage), SM-4 (zéro fuite d'identité), SM-5 (le lycée peut constater l'outil) — aucune métrique de type DAU/volume de messages qui mesurerait l'usage sans valider la promesse. Les deux contre-métriques (SM-C1, SM-C2) sont présentes et contrebalancent explicitement une tentation future précise (réduire la sensibilité de la détection ; sacrifier la qualité humaine à la vitesse).

### Findings
Aucun.

## Done-ness clarity — adequate

La quasi-totalité des FR a des "Conséquences (testables)" qui donnent à un développeur une condition vérifiable sans ambiguïté (FR-1, FR-2, FR-3, FR-8, FR-9, FR-10, FR-12, FR-13 en particulier sont irréprochables). Un point détonne cependant.

### Findings
- **medium** Seuil de notification non borné (§4.4, FR-7) — "Un Organisateur est notifié dans un délai court (cible : quelques minutes maximum)" et la conséquence testable associée reste "le délai... est mesurable et cible quelques minutes". C'est la seule FR du document qui utilise un adjectif ("court") assorti d'une cible non chiffrée plutôt qu'un seuil ferme, alors que c'est justement la FR sur laquelle repose la promesse de délai de réponse (SM-3). *Fix:* remplacer par un seuil explicite et mesurable, par ex. "au moins un Organisateur reçoit la notification en moins de N minutes dans X% des cas pendant les heures d'ouverture du service" — à définir avec Charles au moment de choisir le canal en architecture, mais la FR elle-même devrait déjà porter un nombre plutôt qu'un renvoi complet à l'architecture.

## Scope honesty — strong

Le §5 (Non-Goals explicites) fait un vrai travail : sept renoncements nommés avec leur raison ("compromis assumé pour rester simple, pas un oubli"), et le renoncement le plus surprenant (récupération de conversation multi-appareils) porte le tag `[NON-GOAL for MVP]`. Les six `[ASSUMPTION]` sont toutes indexées en §9 et roundtrippent correctement (voir Notes mécaniques). La densité d'items ouverts (6 Questions ouvertes + 6 assumptions + 2 NOTE FOR PM) est élevée en valeur absolue mais proportionnée aux enjeux réels : données de santé mentale de mineurs, statut légal incertain, absence de deadline externe qui rend la construction possible sans attendre ces réponses. Le PRD distingue bien ce qui bloque la construction (rien) de ce qui bloque un lancement public élargi (Q2, Q4) — c'est exactement la discipline attendue d'un PRD "prêt à construire" à enjeux élevés.

### Findings
- **low** Tag `[NON-GOAL for MVP]` appliqué à un seul renoncement sur sept (§5) — les six autres bullets du même paragraphe sont tout aussi définitifs pour le MVP mais non tagués, ce qui rend le tag isolé plutôt que systématique. *Fix:* soit taguer chaque renoncement du MVP de façon uniforme, soit retirer le tag unique puisque la section entière s'appelle déjà "Non-Goals explicites" (redondance mineure, sans conséquence pratique).

## Downstream usability — adequate

Le Glossaire (§3) est utilisé avec constance dans la majorité du document, les ID (FR-1 à FR-13, UJ-1 à UJ-5, SM-1 à SM-5 + SM-C1/C2) sont contigus et sans doublon, et les références croisées ("Réalise UJ-X", "Valide FR-X") résolvent correctement vers des IDs existants. Deux UJ rompent cependant le standard "protagoniste nommé" posé par Amara (UJ-1, UJ-3) et Léo (UJ-5).

### Findings
- **medium** Protagonistes non nommés dans UJ-2 et UJ-4 (§2.3) — UJ-2 ("Le binôme de Charles") et UJ-4 ("Un élève écrit une phrase qui évoque des idées noires") restent des rôles génériques plutôt que des personas nommés, alors que UJ-1/UJ-3/UJ-5 donnent chacun un prénom et un contexte incarné. Pour UJ-4 en particulier, l'anonymat pourrait être un choix délibéré (le scénario de danger généralise volontairement au-delà d'un cas individuel) mais ce choix n'est pas justifié explicitement, ce qui laisse deviner s'il s'agit d'un oubli ou d'une intention. *Fix:* donner un prénom au binôme de Charles dans UJ-2 (cohérence avec les autres UJ) ; pour UJ-4, soit assigner un prénom, soit ajouter une phrase justifiant explicitement pourquoi ce UJ reste volontairement générique.

## Shape fit — strong

Le PRD adopte la bonne forme pour un produit consumer à UX significative : les UJ à protagoniste nommé sont porteurs (malgré les deux exceptions ci-dessus), sans sur-formalisation (5 UJ, pas plus). Le caractère brownfield (site Wix existant) est traité correctement : FR-12 distingue explicitement ce qui remplace l'existant ("remplaçant le texte promotionnel actuel") de ce qui est nouveau, sans confusion entre les deux. Le PRD étant en tête de chaîne (alimente `bmad-architecture` et l'UX, §0), l'attention portée à la traçabilité (Glossaire, IDs, Index des hypothèses) est calibrée au bon niveau plutôt que sous-investie.

### Findings
Aucun.

## Notes mécaniques

- **Dérive de casse du Glossaire** — "Signal de danger" est défini avec majuscule en §3, mais apparaît en minuscule dans des titres de section/FR : "Détection automatique de signal de danger" (titre FR-9), "Détection de signal de danger et affichage des numéros d'urgence" (titre §4.5). Sans conséquence de fond, mais à uniformiser pour l'extraction automatique en aval.
- **Index des hypothèses — roundtrip complet et correct.** Les 6 `[ASSUMPTION]` inline (§2.3 UJ-4, §4.1, §4.2/FR-3, §4.5 description, §4.5/FR-9, §4.6/FR-11) sont toutes reprises dans l'Index (§9), et aucune entrée de l'Index n'est orpheline. Point positif, pas une action à mener.
- **Continuité des ID** — FR-1 à FR-13 contigus sans trou ni doublon ; UJ-1 à UJ-5 contigus ; SM-1 à SM-5 plus SM-C1/SM-C2. Références croisées ("Réalise UJ-X", "Valide FR-X") vérifiées, toutes résolvent vers un ID existant.
- **Renvoi vers le brief** — le lien relatif `../../briefs/brief-la-parole-contre-tous-2026-07-06/brief.md` (§0) pointe vers un fichier qui existe bien sur le disque ; pas de lien cassé.
- **Protagonistes de UJ** — voir finding medium ci-dessus (UJ-2, UJ-4 sans prénom).
