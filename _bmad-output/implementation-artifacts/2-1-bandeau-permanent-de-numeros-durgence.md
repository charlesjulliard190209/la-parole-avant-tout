---
baseline_commit: 9b5e3c73504bcb50c75c7a98ddd9cd617b161f2e
---

# Story 2.1: Bandeau permanent de numéros d'urgence

Status: annulée (voir Change Log 2026-07-10) — décision produit de Charles : aucun numéro d'urgence ne doit être visible côté élève, même hors détection. Code reverté. Conservée ici pour traçabilité ; ne pas reprendre cette implémentation.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève sur le chat,
I want toujours voir les numéros d'urgence, indépendamment de toute détection automatique,
so that j'y ai accès même si la détection est en panne ou rate quelque chose.

## Acceptance Criteria

1. Given je suis sur n'importe quel écran de la page `/discussion-anonyme` (divulgation + choix de mode, récupération de Code, conversation en cours), When la page se charge, Then un bandeau/lien vers les numéros d'urgence (UK) est visible à l'écran, sans clic caché — pas de contenu replié par défaut (`<details>`, accordéon, lien "en savoir plus" non déployé). [Source: epics.md#Story-2.1, prd.md#FR-8 "le bandeau/lien vers les numéros d'urgence est visible sur chaque écran du chat, sans clic caché"]
2. Given ce bandeau, Then son code ne lit, n'importe et n'appelle **aucune** fonction, variable ou état lié à la détection de Signal de danger (FR-9, Story 2.2 — pas encore implémentée à ce stade du projet) : le composant est statique, sans props, sans logique conditionnelle sur un état de détection. [Source: epics.md#Story-2.1 "ce bandeau ne dépend d'aucun mécanisme de détection", prd.md NFR-3 "FR-8 ne doit jamais dépendre de FR-9 pour fonctionner", ARCHITECTURE-SPINE.md Capability Map "Bandeau permanent urgence (FR-8) — statique, ne dépend pas de FR-9"]
3. Given le contenu affiché, Then il liste au minimum : Samaritans (116 123), Childline (0800 1111), urgences (999), non-urgences (111) — chaque numéro est un lien `tel:` cliquable (appel direct depuis mobile). **Cette liste précise est une hypothèse non validée** reprise telle quelle de l'addendum PRD, explicitement qualifiée de "non figée" — voir Dev Notes et la question ouverte en fin de document avant de la considérer définitive. [Source: prd/addendum.md "UK : Samaritans 116 123, Childline 0800 1111, urgences 999/111 — liste exacte à confirmer/valider en architecture, ne pas la considérer figée"; prd/review-adversarial-crisis.md Finding 8]
4. Given un élève sur mobile ou sur desktop, Then le bandeau reste lisible et les liens `tel:` restent utilisables sur les deux formats (cohérence transverse déjà établie pour FR-1, Story 1.3). [Source: prd.md §6.1; epics.md#Story-1.3]

## Tasks / Subtasks

- [x] Task 1: Créer le composant statique `app/discussion-anonyme/emergency-banner.tsx` (AC: #1, #2, #3, #4)
  - [x] Server Component par défaut (pas de `"use client"` — aucune interactivité, aucun state, aucun besoin de JS côté client). Export nommé, ex. `EmergencyBanner`, sans aucune prop.
  - [x] Contenu 100% statique en dur dans le JSX : un titre court (ex. "Besoin d'aide tout de suite ?"), puis les 4 contacts de l'AC #3, chacun sous forme `<a href="tel:116123">Samaritans — 116 123</a>` (retirer espaces/tirets dans le `href`, les garder dans le texte affiché pour la lisibilité).
  - [x] **Contrainte non-négociable (AC #2, NFR-3)** : ce fichier n'importe rien depuis `lib/danger-keywords.ts` (n'existe pas encore, Story 2.2), ni depuis aucun module lié à la détection. Aucune prop, aucun `useState`/`useEffect`, aucun appel Supabase. Un futur bug ou une panne dans la détection (Story 2.2, à venir) ne doit avoir strictement aucune façon d'atteindre ce composant.
  - [x] Contenu visible immédiatement au rendu — pas de `<details>`/accordéon replié par défaut, pas de lien "en savoir plus" qui masquerait les numéros eux-mêmes (AC #1 : "sans clic caché"). Un lien `tel:` reste acceptable (il **exécute** une action, il ne **révèle** pas un contenu cliqué caché) tant que le numéro est déjà lisible en texte à l'écran.
  - [x] Styles Tailwind cohérents avec le reste du dossier : réutiliser les classes déjà établies dans `page.tsx`/`mode-choice.tsx` (`rounded-xl border border-zinc-200 p-4 dark:border-zinc-700`, texte `text-zinc-700 dark:text-zinc-300`, etc.) — dark mode systématique comme les autres composants de ce dossier.

- [x] Task 2: Intégrer le bandeau dans `app/discussion-anonyme/page.tsx` (AC: #1, #2)
  - [x] Importer `EmergencyBanner` et le rendre **une seule fois**, positionné en dehors des deux branches conditionnelles existantes (`etapePrete && conversationId ? ... : ...`) — par exemple juste après le `<h1>` et avant le premier `<div className="mt-4 ...">`, à l'intérieur du même conteneur `<div className="w-full max-w-xl ...">`. Comme il n'y a qu'un seul retour JSX pour toute la page, un placement en dehors des deux branches suffit à couvrir "n'importe quel écran du chat" (AC #1) sans dupliquer le rendu.
  - [x] Ne passer **aucune prop** venant de l'état de la page (`etapePrete`, `conversationId`, `erreurEphemere`, `messages`) au composant — il doit s'afficher à l'identique quel que soit l'état de navigation (AC #2).
  - [x] Ne rien changer au reste du rendu existant (divulgation, choix de mode, récupération de Code, fil de conversation) : cette story ajoute un élément, elle ne modifie aucune branche existante.

- [x] Task 3: Vérification manuelle (AC: #1 à #4)
  - [x] Confirmer par lecture du fichier `emergency-banner.tsx` qu'aucun import ne référence `danger-keywords`, `lib/session.ts`, `supabase-server`, ou tout état de détection (`grep -i "danger\|priority\|supabase" app/discussion-anonyme/emergency-banner.tsx` ne doit rien retourner en dehors du texte affiché lui-même).
  - [x] Contre le serveur `next dev` réel : requêtes HTTP (`curl`) sur `/discussion-anonyme` dans au moins 3 états observables (aucun paramètre ; `?erreur=ephemere` ; `?etape=pret&conv=<id>` avec une conversation de test) → dans les 3 réponses HTML, confirmer la présence des 4 numéros de l'AC #3 (recherche texte, ex. `grep -c "116 123"` doit valoir 1 dans chaque réponse).
  - [x] `npm run lint` et `npm run build` : aucune erreur.
  - [ ] Rendu mobile/desktop du bandeau (lisibilité, liens `tel:` cliquables) — **à confirmer par Charles**, comme pour les stories précédentes (1.4/1.5), non vérifiable par l'agent sans navigateur.

## Dev Notes

- **Cette story est volontairement indépendante de tout le reste de l'Epic 2.** La rétrospective de l'Epic 1 (2026-07-09) confirme explicitement que la Story 2.1 "n'est pas concernée" par la refonte en cours de FR-10 (bascule vers alerte silencieuse aux organisateurs, plus de popup côté élève — action item encore ouvert, propriété de Charles/John, ne concerne que la Story 2.2). Ne pas anticiper cette refonte ici : ne pas ajouter la ligne CPE/counsellor à ce bandeau (elle reste, dans le PRD actuel, une conséquence testable de FR-10 uniquement, pas de FR-8) et ne rien lier à un futur `is_priority`/`flagged_missed_danger`. [Source: epic-1-retro-2026-07-09.md, "Découverte significative"]
- **Aucun code de détection n'existe encore dans le dépôt** (`lib/danger-keywords.ts` n'a pas été créé — c'est le périmètre de la Story 2.2, qui n'a pas démarré). Le composant de cette story doit donc être écrit comme un bloc totalement autonome, sans aucune dépendance vers un fichier qui n'existe pas encore : à la différence des stories précédentes, il n'y a ici **aucun fichier existant à lire/modifier en profondeur** au sens du Step 3 (READ FILES BEING MODIFIED) hormis `page.tsx`, déjà lu et documenté ci-dessous.
- **`app/discussion-anonyme/page.tsx` (fichier à modifier, déjà lu en entier)** : Server Component `async`, un seul retour JSX avec deux branches (`etapePrete && conversationId` → fil + formulaire de message ; sinon → divulgation + choix de mode + récupération de Code + formulaire éphémère), toutes deux à l'intérieur du même `<div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">`. Le bandeau doit être ajouté à ce niveau, avant la bifurcation des deux branches — ne pas le dupliquer dans chacune des deux branches séparément.
- **Capability Map de l'Architecture** : "Bandeau permanent urgence (FR-8) → `app/discussion-anonyme/page.tsx` (statique, ne dépend pas de FR-9) → gouverné par : —" (aucun AD dédié). Confirme qu'aucune nouvelle table Supabase, aucune Server Action, aucune migration n'est nécessaire pour cette story — c'est un ajout purement présentation (couche "Présentation" du paradigme en couches, jamais besoin de descendre vers `lib/` ou Supabase). [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map]
- **NFR-3, contrainte centrale de cette story** : "FR-8 (bandeau permanent) ne doit jamais dépendre de FR-9 (détection) pour fonctionner." C'est la seule vraie exigence non-fonctionnelle spécifique à cette story — le risque à éviter n'est pas technique (le composant est trivial) mais architectural : ne pas créer, même par facilité, un lien de dépendance (import, prop, condition) entre ce composant et un futur mécanisme de détection. [Source: prd.md NFR-3]
- **Liste de numéros non figée (AC #3)** : reprise telle quelle de l'addendum PRD (2026-07-06), avec cet avertissement explicite du document source : "à confirmer/valider en architecture, ne pas la considérer figée depuis cette recherche." L'Architecture Spine ne l'a pas re-confirmée (aucune mention de "Samaritans"/"Childline" dans `ARCHITECTURE-SPINE.md`) — cette story implémente donc la meilleure information disponible à ce stade, mais le contenu exact reste un point à faire valider par Charles avant un lancement public élargi (cf. question ouverte en fin de document). Ne pas bloquer l'implémentation sur cette confirmation — livrer avec cette liste, signaler le point.
- **Aucune dépendance nouvelle** : liens `tel:` = HTML natif, aucune bibliothèque. Toujours aucun framework de test dans la Stack (Stories 1.1 à 1.5) — vérification manuelle uniquement (Task 3).
- **Conventions transverses toujours valables** : pas de PII élève concernée par cette story (contenu 100% statique, aucune donnée utilisateur) ; aucun log serveur nouveau nécessaire. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Aucun document UX** (`*ux*.md`) n'existe dans les artefacts de planification — le style visuel exact du bandeau est un choix libre à l'implémentation, à aligner avec les styles Tailwind déjà utilisés dans `app/discussion-anonyme/` (dark mode systématique, cohérence avec `mode-choice.tsx`/`recovery-form.tsx`).
- **Convention du dépôt sur la duplication vs abstraction (NFR-1)** : ce dépôt accepte explicitement la duplication de balisage entre petits composants plutôt qu'une abstraction prématurée (déjà tranché pour `recovery-form.tsx` vs `mode-choice.tsx`/`message-form.tsx`, Story 1.5). `emergency-banner.tsx` est un nouveau composant autonome, sans tentative de le généraliser ou de le fusionner avec un composant existant.

### Previous Story Intelligence (Story 1.5)

- Pattern de fichier composant déjà établi trois fois (`mode-choice.tsx`, `message-form.tsx`, `recovery-form.tsx`) : un fichier dédié par écran/concern dans `app/discussion-anonyme/`, classes Tailwind cohérentes, dark mode systématique. `emergency-banner.tsx` suit ce même emplacement et cette même convention de nommage (kebab-case), mais **sans** `"use client"` ni `useActionState` — à la différence des trois précédents, celui-ci n'a aucune interaction/soumission, donc reste un Server Component pur (plus simple, cohérent avec NFR-1).
- La revue de code de la Story 1.5 a établi un rituel désormais attendu : vérification par requêtes HTTP réelles contre le serveur `next dev` (pas seulement lecture de code), `npm run lint`/`npm run build` systématiques, et un rendu mobile/desktop laissé à la confirmation explicite de Charles plutôt que bloquant pour la story — cette story suit le même rituel (Task 3).
- Le dernier commit (`9b5e3c7`) a retiré, dans `page.tsx`, le paragraphe de divulgation annonçant la détection automatique — sans lien avec cette story, mais confirme que `page.tsx` a été modifié très récemment ; relire le fichier dans son état courant avant d'intervenir (déjà fait ci-dessus, contenu documenté).

### Git Intelligence

- 5 derniers commits, tous des stories Epic 1 (`1.1` à `1.5`), plus leurs corrections de revue. Aucun commit ne touche encore `app/discussion-anonyme/emergency-banner.tsx` ni rien lié à FR-8 — première story de l'Epic 2, pas de code existant à ce sujet dans l'historique.
- Convention de message de commit observée : `Story X.Y: <titre court>` puis, si une revue a été appliquée, `(review appliquée)` ou `(review)` en suffixe.

### Project Structure Notes

Fichier à créer par cette story :
- `app/discussion-anonyme/emergency-banner.tsx` — composant statique du bandeau de numéros d'urgence (Task 1)

Fichier à modifier :
- `app/discussion-anonyme/page.tsx` — import et rendu de `<EmergencyBanner />`, une fois, hors des branches conditionnelles existantes (Task 2)

Fichiers **non créés/non touchés** dans cette story, à ne pas anticiper :
- `lib/danger-keywords.ts` — Story 2.2, n'existe pas encore, ne pas le créer ni y faire référence
- `app/discussion-anonyme/{actions.ts,mode-choice.tsx,recovery-form.tsx,message-form.tsx,conversation-thread.tsx}` — inchangés, aucune Server Action nécessaire pour cette story (composant purement présentation)
- Aucune migration Supabase, aucune nouvelle colonne — cette story ne touche à aucune donnée

Aucune variance détectée par rapport à l'arborescence de référence de l'Architecture — `app/discussion-anonyme/page.tsx` est bien l'emplacement prévu pour FR-8 (Capability Map).

### References

- [Source: epics.md#Epic-2, Story-2.1] — story source, AC épics
- [Source: prd.md#FR-8 (§4.5)] — bandeau permanent, conséquence testable "visible sur chaque écran, sans clic caché"
- [Source: prd.md NFR-3] — FR-8 ne doit jamais dépendre de FR-9
- [Source: prd/addendum.md] — liste de numéros UK (Samaritans, Childline, 999/111), explicitement non figée
- [Source: prd/review-adversarial-crisis.md, Finding 8] — liste de numéros non validée, à traiter comme prérequis de lancement
- [Source: ARCHITECTURE-SPINE.md, Capability → Architecture Map] — FR-8 → `app/discussion-anonyme/page.tsx`, statique, aucun AD dédié
- [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions] — pas de PII, pas de secret en log (non applicable ici mais confirmé sans exception)
- [Source: epic-1-retro-2026-07-09.md] — Story 2.1 explicitement non bloquée par la refonte de FR-10 en cours ; ne pas anticiper la ligne CPE/counsellor ici
- [Source: app/discussion-anonyme/page.tsx] — structure actuelle du composant, deux branches conditionnelles, point d'insertion identifié
- [Source: app/discussion-anonyme/mode-choice.tsx, recovery-form.tsx] — conventions Tailwind/dark mode à reproduire

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- **Vérification statique (AC #2)** : `grep -i "danger\|priority\|supabase\|session\|use client\|useState\|useEffect" app/discussion-anonyme/emergency-banner.tsx` → aucune correspondance. Confirme que le composant n'a strictement aucune dépendance vers la détection, la session, ou Supabase.
- **`npm run lint`** : succès, 0 erreur.
- **`npm run build`** (Next.js/Turbopack, avec le vrai `.env.local`) : compilation et typecheck réussis, route `/discussion-anonyme` toujours dynamique (ƒ).
- **Vérification de bout en bout par vraies requêtes HTTP** contre le serveur `next dev` déjà lancé par Charles sur `http://localhost:3000` (non redémarré, même pattern que les Stories 1.4/1.5) :
  - État 1 (aucun paramètre, écran divulgation/choix de mode) : `curl http://localhost:3000/discussion-anonyme` → les 4 numéros (`116 123`, `Childline`, `999`, `111`) présents, chacun une seule fois.
  - État 2 (`?erreur=ephemere`) : mêmes 4 numéros présents, lien `tel:116123` confirmé dans le HTML.
  - État 3 (`?etape=pret&conv=<id>`, écran conversation) : une conversation de test éphémère créée directement via `@supabase/supabase-js` (script Node ad hoc, supprimé après vérification) → les mêmes 4 numéros présents dans cet état également, confirmant que le bandeau ne dépend pas de l'état de navigation (AC #2). Conversation de test supprimée immédiatement après.
- Aucune donnée de test résiduelle : la conversation créée pour l'état 3 a été supprimée après la vérification ; aucune autre table touchée.

### Completion Notes List

- Task 1 à 3 entièrement implémentées : composant statique `emergency-banner.tsx` (aucune prop, aucun import lié à la détection/session/Supabase), intégration dans `page.tsx` une seule fois hors des branches conditionnelles.
- Les 4 AC sont couverts et vérifiés par des requêtes HTTP réelles contre le serveur `next dev` et la vraie base Supabase dans 3 états de navigation distincts (AC #1, #2), par lecture statique du fichier (AC #2), et par relecture du contenu affiché (AC #3, #4 — liens `tel:` natifs, aucune bibliothèque, cohérents mobile/desktop par les mêmes classes Tailwind que le reste du dossier).
- Seul point non vérifié dans cette session : rendu visuel mobile/desktop du bandeau, laissé à la confirmation explicite de Charles (même choix que les Stories 1.4/1.5).
- Aucun fichier existant modifié au-delà de ce que Task 2 prévoyait (`page.tsx` : ajout d'un import + un bloc JSX, aucune branche conditionnelle existante modifiée) ; `actions.ts`, `mode-choice.tsx`, `recovery-form.tsx`, `message-form.tsx`, `conversation-thread.tsx` inchangés, conforme aux Dev Notes.
- Question ouverte non résolue par cette story (documentée dans l'AC #3 et les Dev Notes) : la liste exacte des numéros d'urgence reste une hypothèse non validée de l'addendum PRD — à confirmer avec Charles avant un lancement public élargi.

### File List

- `app/discussion-anonyme/emergency-banner.tsx` (créé — composant statique `EmergencyBanner`, 4 numéros d'urgence UK en liens `tel:`)
- `app/discussion-anonyme/page.tsx` (modifié — import et rendu de `<EmergencyBanner />`, une fois, avant la bifurcation des branches conditionnelles existantes)

## Change Log

- 2026-07-09 : Story créée (create-story) — première story de l'Epic 2, indépendante de la refonte de FR-10 en cours (voir rétrospective Epic 1). Question ouverte : liste exacte des numéros d'urgence à confirmer avec Charles avant un lancement public.
- 2026-07-09 : Implémentation complète de la Story 2.1 — composant statique `emergency-banner.tsx` (aucune dépendance vers la détection/session/Supabase, conformément à NFR-3), intégration dans `page.tsx`. Vérifié par `lint`/`build`, par lecture statique du fichier, et par de vraies requêtes HTTP contre le serveur `next dev` réel dans 3 états de navigation (divulgation, erreur éphémère, conversation prête). Rendu mobile/desktop non confirmé visuellement dans cette session — laissé à la confirmation de Charles. Les 3 tasks et les 4 AC sont satisfaits — passage en `review`.
- 2026-07-09 : Revue de code (7 angles de recherche + vérification à 1 vote) — 3 signalements candidats (duplication `numero`/`tel`, div wrapper pour la marge, risque de confusion avec la divulgation FR-14 retirée en Story 1.5), tous les 3 REFUTED après vérification. Aucun problème retenu.
- 2026-07-10 : **Story annulée sur décision de Charles.** Pendant une relecture du fichier de story, Charles a indiqué explicitement que l'élève ne doit voir aucun numéro d'urgence nulle part dans le chat — y compris le bandeau permanent (FR-8), pas seulement l'affichage déclenché par la détection (FR-10, déjà changé en rétrospective de l'Epic 1). Cette story part donc d'une prémisse (FR-8 tel qu'écrit dans le PRD/epics.md) désormais invalidée. Actions prises : `app/discussion-anonyme/page.tsx` reverté à son état d'avant cette story (`git checkout HEAD --`), `app/discussion-anonyme/emergency-banner.tsx` supprimé. Aucun commit n'avait été fait pour cette story — rien à défaire côté historique Git. Story conservée dans ce fichier pour traçabilité, marquée `annulée` en en-tête. **Ne pas réimplémenter FR-8 tel quel** sans nouvelle décision explicite de Charles. Action item ouvert ajouté dans `sprint-status.yaml` (epic 2) pour la mise à jour formelle du PRD (FR-8/NFR-3), d'epics.md (cette story) et de l'Architecture Spine (Capability Map) — propriété Charles/John, comme pour l'action item équivalent de FR-10. **Conséquence produit à noter** : le filet de sécurité automatique décrit dans la Vision du PRD (§1, "numéros d'urgence automatiques + escalade humaine") perd son premier étage ; avec FR-10 déjà passé en alerte silencieuse (pas de popup non plus), il ne reste plus aucun mécanisme automatique visible côté élève — seule l'escalade humaine (FR-11, lecture des messages par les organisateurs) agit comme filet de sécurité restant.
