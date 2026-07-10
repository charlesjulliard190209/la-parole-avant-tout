# Deferred Work

## Deferred from: code review of 2-3-procedure-descalade-humaine-documentee (2026-07-10)

- Signal de danger concernant un tiers (pas l'Élève lui-même) non couvert par la procédure d'escalade (`docs/procedure-escalade-cpe-counsellor.md`) — FR-9 définit le Signal de danger uniquement autour des idées suicidaires/de l'automutilation de l'Élève lui-même ; un message décrivant un danger venant d'un tiers (ex. maltraitance en cours) est une classe d'escalade différente non couverte. Extension de périmètre à trancher au niveau produit (FR-9), pas dans cette story.
- Aucune boucle de confirmation/clôture avec la CPE après l'appel d'escalade — orthogonal au cœur des AC de cette story (informer la CPE), question de process plus large non bloquante pour l'usage immédiat de la procédure.

## Deferred from: code review of 1-1-mise-en-place-du-projet-et-divulgation-de-confidentialite (2026-07-08)

- `app/page.tsx` (racine "/") reste le boilerplate par défaut de `create-next-app` (liens sortants Vercel/Next.js). Déjà noté dans le File List de la story comme "pas encore celui d'Epic 4" ; propriété de la Story 4.1 (point d'entrée vers le chat).
- `messages.body` n'a pas de contrainte anti-vide (`not null` accepte `''`). La validation du contenu d'un message relève de la Story 1.3 (envoi du premier message et accusé de réception).
- Historique de migrations de la CLI Supabase désynchronisé de la base réelle (migration appliquée à la main via SQL Editor suite à l'échec de `supabase db push` — bug connu du pooler Supavisor). Le SQL est idempotent (`if not exists`) donc sans risque immédiat, mais à réconcilier avant la prochaine migration (Story 1.5).

## Deferred from: code review of 1-2-choix-du-mode-de-conversation-sauvegarder-ou-ephemere (2026-07-08)

- Race condition TOCTOU sur l'unicité du Code : `isCodeAvailable` et l'`insert` dans `choisirModeSauvegarder` ne sont pas atomiques, et le sel bcrypt empêche toute contrainte d'unicité en base. Deux élèves soumettant le même Code en même temps peuvent tous les deux réussir. **Décision de Charles (2026-07-08)** : risque accepté, jugé improbable à l'échelle d'un lycée — aucune action pour l'instant.
- Le paramètre `mode=ephemere` est posé sur la redirection de `choisirModeEphemere` mais jamais lu dans `page.tsx` — soit à exploiter (message spécifique au mode éphémère sur l'écran "prêt"), soit à supprimer.
- Visiter `?conv=<id>` sans `?etape=pret` retombe silencieusement sur l'écran de choix de mode plutôt que de gérer explicitement cet état partiel — non bloquant, aucune AC ne le couvre.
- Aucune limitation de débit sur `choisirModeSauvegarder`, qui déclenche une boucle `bcrypt.compare` en O(n) à chaque soumission. Le O(n) lui-même est un compromis d'architecture assumé (Dev Notes/NFR-1), mais l'absence de limitation de débit reste un vecteur d'épuisement CPU distinct — à traiter dans un futur passage de durcissement.

## Deferred from: code review of 1-3-envoi-du-premier-message-et-accuse-de-reception (2026-07-09)

- Le Code de récupération est mis en minuscules dans `choisirModeSauvegarder` (`app/discussion-anonyme/actions.ts:44`) sans que `mode-choice.tsx` n'avertisse l'élève que son Code est insensible à la casse. Code/copie de la Story 1.2, non touchés par le diff de la Story 1.3 — repéré seulement maintenant.
- (Pour mémoire, pas une nouvelle entrée) La race TOCTOU sur l'unicité du Code, le scan O(n) `bcrypt.compare` et l'absence de limitation de débit ont été re-signalés par cette revue mais sont déjà couverts par les entrées ci-dessus (revue de la Story 1.2, 2026-07-08) — décision de Charles déjà actée, rien de nouveau à trancher.

## Deferred from: code review of 1-5-recuperation-dune-conversation-via-code (2026-07-09)

- `recovery-form.tsx` duplique intégralement le balisage des formulaires `mode-choice.tsx`/`message-form.tsx` (wrapper, label/input, message d'erreur, bouton) sans composant partagé — cohérent avec la préférence déjà documentée de ce dépôt pour la duplication à cette échelle (NFR-1) plutôt qu'une abstraction prématurée, comme déjà tranché pour la triplication du scan bcrypt dans `lib/session.ts` (Story 1.4/1.5). Aucune action pour l'instant.
- Verrou anti-brute-force (`recovery_attempts`) contournable par requêtes concurrentes (TOCTOU) : `isRecoveryLocked` et `recordRecoveryAttempt` ne sont pas atomiques. **Décision de Charles (2026-07-09)** : risque accepté, même position que la race TOCTOU sur l'unicité du Code (Story 1.2) — aucune action pour l'instant.
- Le verrouillage anti-brute-force échoue "ouvert" (fail-open) sur toute erreur Supabase transitoire, désactivant temporairement la protection. **Décision de Charles (2026-07-09)** : conservé tel quel, cohérent avec le reste du code (NFR-2) — aucune action pour l'instant.
- Le verrou anti-brute-force est partagé par IP brute : des élèves derrière la même IP (Wi-Fi/NAT du lycée) partagent le même compteur de tentatives. **Décision de Charles (2026-07-09)** : risque accepté, situation jugée rare — aucune action pour l'instant.
- Récupérer une conversation via Code sur un nouvel appareil invalide silencieusement le cookie de tout autre appareil déjà connecté à cette conversation, sans message d'erreur affiché sur cet autre appareil. **Décision de Charles (2026-07-09)** : laissé silencieux, cas jugé rare — aucune action pour l'instant.
