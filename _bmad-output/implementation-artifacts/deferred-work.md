# Deferred Work

## Deferred from: code review of 1-1-mise-en-place-du-projet-et-divulgation-de-confidentialite (2026-07-08)

- `app/page.tsx` (racine "/") reste le boilerplate par défaut de `create-next-app` (liens sortants Vercel/Next.js). Déjà noté dans le File List de la story comme "pas encore celui d'Epic 4" ; propriété de la Story 4.1 (point d'entrée vers le chat).
- `messages.body` n'a pas de contrainte anti-vide (`not null` accepte `''`). La validation du contenu d'un message relève de la Story 1.3 (envoi du premier message et accusé de réception).
- Historique de migrations de la CLI Supabase désynchronisé de la base réelle (migration appliquée à la main via SQL Editor suite à l'échec de `supabase db push` — bug connu du pooler Supavisor). Le SQL est idempotent (`if not exists`) donc sans risque immédiat, mais à réconcilier avant la prochaine migration (Story 1.5).

## Deferred from: code review of 1-2-choix-du-mode-de-conversation-sauvegarder-ou-ephemere (2026-07-08)

- Race condition TOCTOU sur l'unicité du Code : `isCodeAvailable` et l'`insert` dans `choisirModeSauvegarder` ne sont pas atomiques, et le sel bcrypt empêche toute contrainte d'unicité en base. Deux élèves soumettant le même Code en même temps peuvent tous les deux réussir. **Décision de Charles (2026-07-08)** : risque accepté, jugé improbable à l'échelle d'un lycée — aucune action pour l'instant.
- Le paramètre `mode=ephemere` est posé sur la redirection de `choisirModeEphemere` mais jamais lu dans `page.tsx` — soit à exploiter (message spécifique au mode éphémère sur l'écran "prêt"), soit à supprimer.
- Visiter `?conv=<id>` sans `?etape=pret` retombe silencieusement sur l'écran de choix de mode plutôt que de gérer explicitement cet état partiel — non bloquant, aucune AC ne le couvre.
- Aucune limitation de débit sur `choisirModeSauvegarder`, qui déclenche une boucle `bcrypt.compare` en O(n) à chaque soumission. Le O(n) lui-même est un compromis d'architecture assumé (Dev Notes/NFR-1), mais l'absence de limitation de débit reste un vecteur d'épuisement CPU distinct — à traiter dans un futur passage de durcissement.
