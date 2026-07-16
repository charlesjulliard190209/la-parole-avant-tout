---
baseline_commit: 88519fe62040418fb199ff301d56f113cce3fdf2
---

# Story 4.2: Section dédiée au deuxième profil

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève sollicité par un camarade exclu que je ne souhaite pas fréquenter,
I want trouver des repères sur comment répondre avec respect sans me sentir obligé,
so that je peux agir même sans passer par le chat si je préfère.

> Story de **vitrine (FR-13)**, dernière story de l'Epic 4. Elle crée la route `app/camarade-exclu/page.tsx` (emplacement canonique fixé par l'architecture) : une page de contenu dédiée au **deuxième profil** du produit — l'élève (persona « Léo », PRD UJ-5) sollicité en amitié par un camarade marginalisé qu'il n'a pas envie de fréquenter, et qui cherche comment poser une limite saine **sans rejeter brutalement** et **sans se sentir obligé** d'accepter une relation non désirée.
>
> **Urgence particulière : cette route est déjà liée depuis le site.** La Story 4.1 (en review) a ajouté dans le header (`components/site-header.tsx`) un lien « Aider un camarade » → `/camarade-exclu`, avec **404 temporaire assumé** (décision Fab, 2026-07-16) en attendant cette story. Livrer la 4.2 ferme ce trou.
>
> **Aucun contenu source n'existe** : la page Wix « Dangers du Harcèlement » n'est PAS l'équivalent de FR-13 (confirmé en 4.1). Le contenu est à écrire — une base éditoriale complète est fournie en Dev Notes § Contenu proposé, à valider avec Charles au checkpoint.

## Acceptance Criteria

1. **La page `/camarade-exclu` existe et présente des repères dédiés, distincts du chat.** `app/camarade-exclu/page.tsx` (Server Component purement présentationnel) affiche une page complète : titre clair, et des repères concrets sur **comment répondre avec respect à un camarade exclu sans se sentir obligé d'accepter une relation non désirée** (base éditoriale en Dev Notes § Contenu proposé, validée avec Charles). Le lien « Aider un camarade » du header ne produit plus de 404. *[Source: PRD FR-13 ; epics.md Story 4.2 ; ARCHITECTURE-SPINE.md#Capability Map]*
2. **La section est accessible depuis la navigation principale, pas seulement mentionnée dans le chat.** Depuis la page d'accueil, le lien header « Aider un camarade » (déjà présent, `components/site-header.tsx`) mène à la page. Sur `/camarade-exclu` elle-même, la navigation est **visible et fonctionnelle** (retour accueil + accès chat) — attention : le `SiteHeader` actuel reste masqué sans repère `#hero-logo-sentinel`, il doit être adapté (voir Dev Notes § Piège SiteHeader). Le comportement « révélé au scroll » sur `/` reste **inchangé**. *[Source: PRD FR-13 conséquence testable #1]*
3. **Le chat reste un complément ouvert à ce profil, pas un substitut — et réciproquement.** La page contient un appel à l'action vers `/discussion-anonyme` invitant à poser une question individuelle, anonymement (le mécanisme est identique pour ce profil : même chat, même anonymat — PRD UJ-5). La page ne présente jamais le chat comme réservé aux victimes, ni les repères comme suffisants « à la place » du chat. *[Source: PRD FR-13 conséquence testable #2 ; PRD UJ-5]*
4. **Ton et sécurité du contenu.** Tutoiement, présent, bienveillant, **jamais culpabilisant** (le message central : tu as le droit de ne pas vouloir cette amitié ; poser une limite avec respect n'est pas du rejet). **Aucun numéro d'urgence ni ressource téléphonique nulle part sur la page** (décision Charles 2026-07-10, retrait FR-8 : l'élève ne doit voir aucun numéro d'urgence nulle part dans le produit). Rien de « à venir »/promotionnel (FR-12 s'applique à tout le site).
5. **La page utilise la fondation « Doux & rassurant » (Story 4.0) et reste cohérente avec l'accueil.** Tokens sémantiques uniquement (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-accent`, `bg-muted`, `border-border`, `primary`), titres en `font-heading`, CTA via `Button` (`asChild` + `Link`). **Aucune couleur `zinc-*` ou `dark:` codée en dur.** Réutiliser `Reveal` pour les apparitions au scroll est bienvenu (cohérence avec `/`) mais optionnel.
6. **Accessibilité.** Hiérarchie de titres correcte (un seul `h1`, puis `h2`), liens = vrais `<a>` navigables au clavier avec libellés explicites, focus visible, contraste suffisant. Si `Reveal` est utilisé, `prefers-reduced-motion` est déjà respecté par le composant. La page exporte une `metadata` locale (`title` du type « Aider un camarade — La Parole Avant Tout », `description` propre).
7. **Aucune régression.** `npm run build` et `npm run lint` passent. `/`, `/discussion-anonyme`, `/organisateurs/**`, `/styleguide` inchangés. `app/layout.tsx` non modifié. Sur `/`, le header garde exactement son comportement actuel (masqué en haut, révélé au scroll).

## Tasks / Subtasks

- [x] **Task 1 — Adapter `components/site-header.tsx` pour les pages sans hero** (AC: #2, #7)
  - [x] Ajouter une prop (ex. `alwaysVisible?: boolean`, défaut `false`) : quand elle est vraie, le header est rendu visible en permanence, sans `IntersectionObserver` ni dépendance au repère `#hero-logo-sentinel`. Quand elle est fausse, comportement actuel strictement inchangé (y compris le repli « pas de repère → masqué »).
  - [x] Sur `/camarade-exclu`, le header fixe recouvre le haut de page → compenser (padding-top sur le contenu, ou variante non-`fixed` quand `alwaysVisible`). Choisir la solution la plus simple et lisible (NFR-1). → Solution retenue : `sticky top-0` en flux normal quand `alwaysVisible` (pousse le contenu, aucun padding compensatoire côté page).
  - [x] Optionnel (si trivial) : marquer la page courante dans la nav (`aria-current="page"` sur « Aider un camarade »). Ne pas restructurer la nav au-delà. → Fait via `usePathname()` : `aria-current="page"` posé automatiquement sur le lien correspondant à la route courante (chat + camarade).
- [x] **Task 2 — Créer `app/camarade-exclu/page.tsx` : structure + repères** (AC: #1, #4, #5, #6)
  - [x] Server Component **synchrone**, purement présentationnel : aucun accès Supabase, aucune Server Action, aucun `cookies()`, aucun `"use client"` sur la page elle-même.
  - [x] Exporter `metadata` locale (title + description).
  - [x] `<main className="flex flex-1 flex-col …">` (pattern du layout `<body>` flex-col, comme `/`), `<SiteHeader alwaysVisible />`, intro (h1 + chapeau), 3–4 repères (h2 + paragraphe — `Card` de la fondation ou prose simple, au choix), section « et si tu ne sais pas quoi faire ? » avec CTA chat, footer identique à celui de `/` (logo + « La Parole Avant Tout © 2026 »).
  - [x] Intégrer la base éditoriale de Dev Notes § Contenu proposé (adaptable, l'esprit prime). Relire contre l'AC #4 : jamais culpabilisant, aucun numéro d'urgence, rien de « à venir ».
- [x] **Task 3 — CTA vers le chat (complément, pas substitut)** (AC: #3)
  - [x] `<Button asChild size="lg"><Link href="/discussion-anonyme">…</Link></Button>` avec un libellé explicite orienté question (ex. « Pose ta question, anonymement ») — cohérent avec « Parler à quelqu'un » de l'accueil mais adapté à ce profil.
  - [x] Une phrase d'accompagnement : anonyme, sans inscription, une vraie personne du lycée répond — même mécanisme que pour tout le monde.
- [x] **Task 4 — Vérifier non-régression et build** (AC: #2, #7)
  - [x] `npm run build` OK, `npm run lint` OK (`.env.local` requis pour builder — condition pré-existante, voir Dev Notes § Build). `/camarade-exclu` apparaît en route **statique (○)**.
  - [x] Parcours complet : `/` → scroll → header apparaît → clic « Aider un camarade » → page s'affiche (plus de 404) → header visible d'emblée → CTA `/discussion-anonyme` en place → logo header → retour `/`. Vérifié dans le navigateur (captures).
  - [x] Sur `/` : comportement scroll du header strictement inchangé (masqué en haut, révélé après le logo). Vérifié dans le navigateur.
  - [x] `/discussion-anonyme`, `/organisateurs/connexion`, `/styleguide` inchangés (build : routes présentes et non modifiées ; aucun fichier de ces dossiers touché).
  - [ ] **Checkpoint Charles** : valider le contenu éditorial (les repères), le libellé de nav « Aider un camarade » (provisoire depuis la 4.1) et le libellé du CTA avant de clôturer. → En attente de validation humaine (voir Completion Notes).

### Review Findings

_Revue de code adversariale (3 couches : Blind Hunter, Edge Case Hunter, Acceptance Auditor) — 2026-07-16. Verdict global : les 7 AC sont satisfaits ; aucun blocage. Findings restants ci-dessous._

- [ ] [Review][Patch] Commentaire « 404 temporaire assumé » désormais obsolète (la route existe depuis cette story) [components/site-header.tsx:21-22]
- [ ] [Review][Patch] Cadres « wipe » sans `bg-muted` → cadre vide/transparent pendant la révélation 800ms (l'accueil pose `bg-muted`/`bg-card`, ici absent) [app/camarade-exclu/page.tsx:75, 126]
- [ ] [Review][Patch] `sizes` surdéclare la largeur de l'image CTA (conteneur `max-w-sm` ~384px mais `sizes` annonce 50vw) → candidat trop lourd téléchargé [app/camarade-exclu/page.tsx:133]
- [ ] [Review][Patch] Deux landmarks `<nav>` sans libellé distinct (barre + Sheet mobile) → liste de repères a11y ambiguë [components/site-header.tsx:106, 142]
- [ ] [Review][Patch] « Close » en anglais dans le Sheet (`sr-only`) — premier usage utilisateur du composant, UI par ailleurs 100% FR [components/ui/sheet.tsx:80] ⚠️ hors périmètre déclaré « ne pas toucher components/ui/* » — à arbitrer
- [x] [Review][Defer] `prefers-reduced-motion` lu une seule fois (pas de listener `change`) [components/reveal.tsx:56] — deferred, pré-existant (composant 4.1, hors diff)
- [x] [Review][Defer] Sheet ouvert au franchissement du breakpoint `sm` (rotation/resize) → trigger masqué, focus peut retomber sur `<body>` [components/site-header.tsx:125-161] — deferred, edge rare
- [x] [Review][Defer] Constantes de routes (`/discussion-anonyme`, `/camarade-exclu`) dupliquées sur 3 fichiers → risque de désync au renommage [components/site-header.tsx:20, app/camarade-exclu/page.tsx:17] — deferred, dette pré-existante (pattern déjà dans app/page.tsx)
- [x] [Review][Defer] Footer dupliqué verbatim + année `© 2026` codée en dur [app/camarade-exclu/page.tsx:161-174] — deferred, dette pré-existante (identique à l'accueil, candidat `SiteFooter`)
- [x] [Review][Defer] `priority` sur l'image intro probablement pas le LCP mobile (texte-first) → préchargement JPEG en concurrence des fonts/h1 [app/camarade-exclu/page.tsx:83] — deferred, perf discutable

## Dev Notes

### Objectif produit (pourquoi cette story)

FR-13 : le produit sert **deux profils** (PRD §2) — la victime d'exclusion (Amara, UJ-1..4) ET le camarade sollicité qui cherche à bien réagir (Léo, UJ-5). Le chat sert déjà les deux (même mécanisme, seul le motif diffère). Cette story donne au deuxième profil des **repères sans avoir à écrire** : une section dédiée, distincte du chat, accessible depuis la navigation principale. Elle clôt l'Epic 4 (FR-12 ✓ en 4.1, FR-13 = cette story). [Source: prd.md §4.7 + FR-13 + UJ-5 ; epics.md#Epic 4]

### Piège SiteHeader — À TRAITER EN PREMIER (Task 1)

`components/site-header.tsx` (créé en 4.1, **non commité**, dans l'arbre de travail) est conçu pour la page d'accueil : masqué tant que le repère `#hero-logo-sentinel` (posé dans `app/page.tsx`) est visible, révélé au scroll. **Ligne 34 : sans repère dans le DOM, le header reste masqué pour toujours** (`if (!sentinel) return;` avec `visible=false` initial). Poser `<SiteHeader />` tel quel sur `/camarade-exclu` (pas de hero, pas de repère) = **nav invisible = AC #2 échoué**.

Correctif recommandé : prop `alwaysVisible` (défaut `false` = comportement actuel intact sur `/`). Quand `alwaysVisible` : ne pas monter l'observer, rendre le header visible, et régler le recouvrement du contenu (le header est `fixed inset-x-0 top-0`) — soit un `padding-top` équivalent sur le premier bloc de la page, soit rendre le header en flux normal (`sticky top-0` ou statique) dans ce mode. Rester simple et lisible (NFR-1) ; ne pas dupliquer le header en un second composant (réutiliser, pas réinventer). [Source: components/site-header.tsx lignes 27–46 ; 4-1-…md § Ajustement post-implémentation]

### Contenu proposé (base éditoriale à valider avec Charles)

Aucune source Wix pour cette page (« Dangers du Harcèlement » ≠ FR-13). Base proposée, dérivée du PRD (FR-13, UJ-5, user story §2.1) — adaptable dans la forme, **l'esprit est contractuel** : respect + droit de ne pas se sentir obligé + gestes concrets + chat en complément.

- **H1 / chapeau** : « Aider un camarade, à ta façon » — « Un camarade mis à l'écart cherche ton amitié, et tu ne sais pas comment réagir ? Tu n'es pas obligé de devenir son ami pour être respectueux. Voici quelques repères. »
- **Repère 1 — Tu as le droit de poser tes limites.** Ne pas vouloir d'une amitié, ce n'est pas du harcèlement, et ce n'est pas être quelqu'un de mauvais. Tu peux dire non à une relation sans rejeter la personne. Ce qui compte, c'est *comment* tu le dis.
- **Repère 2 — Dire non avec respect.** Rester simple et honnête, sans humilier : pas de moqueries, pas de silence méprisant, pas de « non » devant tout le monde. Une phrase calme et directe suffit — tu peux décliner une invitation tout en disant bonjour demain.
- **Repère 3 — Les petits gestes comptent (et ne t'engagent à rien).** Dire bonjour, ne pas rire quand les autres se moquent, ne pas relayer les rumeurs, adresser la parole normalement en classe. Ces gestes ne font pas de toi son meilleur ami — ils font juste de toi quelqu'un de respectueux, et pour un élève isolé ils changent beaucoup.
- **Repère 4 — Ne pas participer, c'est déjà agir.** Si tu vois de l'exclusion ou des moqueries, tu n'as pas à devenir un héros : ne pas t'y joindre, changer de sujet, ou simplement rester correct avec la personne, c'est déjà une vraie différence.
- **Section finale — « Et si tu ne sais pas quoi faire ? »** : chaque situation est particulière. Tu peux nous poser ta question sur le chat, anonymement — personne ne saura qui tu es, et une vraie personne du lycée te répondra. → CTA `/discussion-anonyme`.

**Interdits de contenu** (AC #4) : aucun numéro d'urgence/ressource téléphonique (décision Charles 2026-07-10 — s'applique à tout le produit, pas seulement au chat) ; aucune culpabilisation (« tu dois », « ce serait égoïste de… ») ; aucun « à venir » ; ne pas présenter la page comme un substitut au chat ni le chat comme réservé aux victimes.

### Contraintes architecture (garde-fous)

- **FR-13 vit dans `app/camarade-exclu/page.tsx`, gouverné par AD-1** (un seul site Next.js). C'est l'emplacement canonique — ne pas choisir un autre nom de route : le header pointe déjà sur `/camarade-exclu` et l'arborescence de référence de l'architecture nomme ce chemin. [Source: ARCHITECTURE-SPINE.md#Capability Map « Section deuxième profil (FR-13) | app/camarade-exclu/page.tsx | AD-1 » ; #Arborescence source]
- **Server Component, aucune donnée.** Purement présentationnel : pas de Supabase, pas de Server Action, pas de `cookies()`, pas d'`await`. Aucune frontière d'écriture (AD-3) ni accès données (AD-4) n'est touchée. La page doit compiler en route **statique** (○) au build, comme `/`.
- **Couche Présentation** : page sous `app/`, composants partagés sous `components/` (pas de `app/camarade-exclu/_components/`). Composants en PascalCase, fichiers en kebab-case. [Source: ARCHITECTURE-SPINE.md#Design Paradigm ; #Consistency Conventions]
- **Aucune nouvelle dépendance** (AD-2 stack verrouillée) : tout existe déjà (fondation 4.0, `Reveal`, `SiteHeader`, `next/image`, `next/link`).
- **NFR-1** : page simple, contenu inline dans `page.tsx` (comme `/`) — pas d'abstraction de contenu (pas de CMS maison, pas de fichier de données séparé pour 4 paragraphes).

### Réutiliser l'existant — NE PAS réinventer

- **Fondation 4.0** (commit `e53f2f6`) : tokens dans `app/globals.css` (`background` crème, `foreground` brun, `primary` terracotta `#b35a38` assombri pour WCAG AA, `secondary` sauge, `accent`, `muted`, `--radius: 0.9rem`), utilitaire `font-heading` (Nunito), composants `components/ui/` (`button`, `card`, `separator`, `badge`, …). Exemples d'usage : `app/styleguide/page.tsx` et `app/page.tsx`.
- **`app/page.tsx` est le modèle direct** pour : structure `<main className="flex flex-1 flex-col bg-background text-foreground">`, sections en bandes alternées (`bg-accent`, `bg-muted`), conteneurs `mx-auto w-full max-w-3xl/max-w-5xl px-6`, titres `font-heading text-3xl font-bold`, CTA `Button asChild` + `Link`, footer. Reprendre ces patterns tels quels = cohérence visuelle garantie (AC #5).
- **`components/reveal.tsx`** (4.1, non commité) : `<Reveal variant="rise">` pour le texte, `variant="wipe"` pour d'éventuelles images ; `delay` pour échelonner ; `prefers-reduced-motion` déjà géré ; pour « wipe », le cadrage visuel va dans `innerClassName` (piège clip-path/IntersectionObserver déjà résolu dans le composant — lire son commentaire de tête avant usage).
- **Images** : aucun asset dédié à cette page n'existe dans `public/` (seulement `logo.png` + les 2 illustrations de l'accueil, déjà utilisées). Page **texte d'abord** : ne pas réutiliser les illustrations de l'accueil (confusion), ne rien hotlinker depuis Wix. Si Charles veut un visuel, il le fournira plus tard (même pattern que 4.1 : fichier dans `public/`, remplaçable sans changer le code).

### État actuel des fichiers touchés

- **`app/camarade-exclu/page.tsx`** — N'EXISTE PAS. À créer (seule nouvelle route de la story).
- **`components/site-header.tsx`** — UPDATE (voir § Piège SiteHeader). État actuel : îlot client `"use client"`, `useState(false)` + `IntersectionObserver` sur `#hero-logo-sentinel`, header `fixed` avec `translate-y`/`opacity` + `aria-hidden={!visible}`, nav = logo→`/`, « Discussion anonyme »→chat, « Aider un camarade »→`/camarade-exclu` (liens texte cachés sous `sm:`), CTA « Parler à quelqu'un ». **À préserver** : le comportement complet sur `/`, le repli sécurité sans repère, les libellés existants (sauf décision Charles au checkpoint).
- **`app/page.tsx`** — NE PAS MODIFIER (sauf si le checkpoint Charles demande un ajustement de libellé). Le lien vers la page passe par le header, déjà en place.
- **`app/layout.tsx`** — NE PAS MODIFIER (fonts, `<body>` flex-col, metadata globale ; la 4.1 a explicitement gardé le header hors layout pour ne pas impacter chat/organisateurs — même règle ici : `SiteHeader` s'importe page par page).
- **Ne pas toucher** : `app/discussion-anonyme/**`, `app/organisateurs/**`, `app/styleguide/**`, `app/globals.css`, `lib/*`, `components/ui/*`.

### Intelligence stories précédentes (4.0, 4.1) — à réutiliser

- **4.1 est en `review`, non commitée** : `app/page.tsx`, `components/site-header.tsx`, `components/reveal.tsx` sont dans l'arbre de travail. **C'est ta base — ne pas la défaire.** Si la review 4.1 modifie ces fichiers entre-temps, repartir de leur état courant.
- **Points laissés ouverts par la 4.1, à fermer au checkpoint de cette story** : libellé nav « Aider un camarade » (provisoire, « à confirmer avec le cadrage final de la 4.2 ») et libellé CTA « Parler à quelqu'un » (validation Charles en attente).
- **Mode sombre** : hérité automatiquement des tokens (media-based, décision 4.0). Ne pas ajouter de `dark:` manuels ni de `@custom-variant dark`.
- **Voix du produit** : tutoiement, présent, rassurant, anti-robot (« une vraie personne du lycée te répond — pas un robot ») — cohérente entre l'accueil et le chat, à reprendre ici.
- **Écriture des apostrophes en JSX** : les fichiers existants utilisent `&apos;` (règle ESLint `react/no-unescaped-entities`) et `&nbsp;` avant `?`/`:` — suivre la même convention.

### Portée : ce qui n'est PAS dans cette story

- **Pas de reskin** du chat ni des pages organisateurs (hors périmètre depuis 4.0).
- **Pas de header global dans `layout.tsx`** (règle 4.1 maintenue).
- **Pas de page « Dangers du Harcèlement »** (page Wix sans équivalent, jamais planifiée).
- **Pas de contenu type podcasts/articles** (Non-Goal PRD §5, brief séparé).
- **Pas de framework de tests** (choix documenté du projet ; l'audit `docs/code-review-report.md` note l'absence de filet comme dette assumée — ne pas l'introduire dans une story de vitrine).

### Build & vérification

- **Vérification = build + lint + inspection visuelle** (aucun framework de test dans le projet — cohérent avec toutes les stories précédentes).
- **`npm run build` exige les variables d'env Supabase** (`.env.local`) même si cette page ne les utilise pas — `lib/env.ts#requireEnv` est évalué par d'autres pages au build. Condition pré-existante documentée en 4.0/4.1 ; `.env.local` est présent dans l'environnement de dev.
- La nouvelle route doit apparaître **statique (○)** dans la sortie du build, comme `/`.
- **Checkpoint Charles avant clôture** : contenu des repères + libellés nav/CTA.

### Git / travail récent

- Dernier commit : `e53f2f6` (Story 4.0, fondation design). **La 4.1 n'est pas commitée** (statut review) : ses fichiers sont en modifié/non-suivi dans l'arbre de travail, avec `docs/code-review-report.md` (audit global, périmètre = commit `2d2d9fe`, sans lien direct avec cette story).
- Branche de travail : `epic-4-site-public`. Convention de commit : `Story X.Y: <résumé> (…)`.

### Project Structure Notes

- Fichiers attendus : **`app/camarade-exclu/page.tsx` (nouveau)** + **`components/site-header.tsx` (modifié : prop `alwaysVisible`)**. Rien d'autre en dehors d'éventuels ajustements de libellés décidés au checkpoint.
- Aligné avec l'arborescence de référence (`app/camarade-exclu/page.tsx  # section dédiée deuxième profil (FR-13)`). Aucune migration, aucune Server Action, aucune nouvelle dépendance. [Source: ARCHITECTURE-SPINE.md#Arborescence source]

### References

- [Source: _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md#FR-13] — section dédiée + 2 conséquences testables (nav principale ; chat = complément).
- [Source: prd.md#4.7] — réorganisation du site : chat central + deuxième volet visible au-delà du chat.
- [Source: prd.md#UJ-5] — persona Léo : poser une limite saine sans blesser ni se sentir obligé ; peut aussi trouver des repères sans écrire.
- [Source: prd.md#2.1] — user story d'origine du deuxième profil (« sans avoir à en parler ouvertement à un adulte ou à mes amis »).
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2] — user story + AC BDD.
- [Source: ARCHITECTURE-SPINE.md#AD-1 + #Capability Map + #Arborescence source] — FR-13 dans `app/camarade-exclu/page.tsx`, un seul site Next.js.
- [Source: _bmad-output/implementation-artifacts/4-1-point-dentree-clair-vers-le-chat.md] — story précédente : fondation réutilisée, header + lien `/camarade-exclu` (404 assumé), libellés provisoires, patterns de page.
- [Source: _bmad-output/implementation-artifacts/4-0-fondation-design-shadcn.md] — tokens, composants, typo, décisions design.
- [Source: components/site-header.tsx] — header à adapter (piège `#hero-logo-sentinel`).
- [Source: components/reveal.tsx] — apparitions au scroll réutilisables (`rise`/`wipe`, reduced-motion géré).
- [Source: app/page.tsx] — modèle de structure/style de page vitrine.
- [Source: app/layout.tsx] — layout global à ne pas modifier.
- Décision Charles (2026-07-10, sprint-status.yaml action_items + epics.md FR-8) : **aucun numéro d'urgence visible par l'élève nulle part dans le produit** — s'applique au contenu de cette page.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, BMAD dev-story workflow)

### Debug Log References

- `npm run lint` : succès (aucune erreur, aucun warning).
- `npm run build` : succès. `/camarade-exclu` généré en route **statique (○)**, aux côtés de `/`, `/organisateurs/connexion`, `/styleguide`. `/discussion-anonyme` et `/organisateurs` restent dynamiques (ƒ), inchangés.
- Vérification navigateur (serveur prod local) : `/camarade-exclu` (200), `/` (200) ; header visible d'emblée sur `/camarade-exclu` sans recouvrement du contenu ; header masqué en haut de `/` puis révélé au scroll (comportement d'origine intact) ; navigation header `/` → « Aider un camarade » → `/camarade-exclu` (plus de 404) ; lien actif marqué `aria-current`.

### Completion Notes List

- **Task 1 — `site-header.tsx`** : ajout de la prop `alwaysVisible` (défaut `false`). En mode `alwaysVisible`, aucun `IntersectionObserver` n'est monté et le header est rendu en flux normal (`sticky top-0`, toujours visible) — il pousse le contenu vers le bas au lieu de le recouvrir, sans padding compensatoire à gérer côté page (choix le plus simple, NFR-1). Le mode par défaut (page d'accueil) est strictement inchangé : `fixed`, révélé au scroll, repli « pas de repère → masqué » préservé. Bonus accessibilité : `aria-current="page"` posé automatiquement sur le lien de nav correspondant à la route courante via `usePathname()`.
- **Task 2 — `app/camarade-exclu/page.tsx` (nouveau)** : Server Component synchrone, purement présentationnel (aucun Supabase, Server Action, `cookies()` ni `"use client"`). `metadata` locale (title « Aider un camarade — La Parole Avant Tout » + description). Structure calquée sur `/` : `<SiteHeader alwaysVisible />` hors `<main>`, `<main className="flex flex-1 flex-col …">`, intro (un seul h1 + chapeau), bande `bg-accent` avec 4 repères en `Card` (chaque titre en `h2`), section finale « Et si tu ne sais pas quoi faire ? » (h2), footer identique à `/`. Tokens sémantiques uniquement, `font-heading` sur les titres, `Reveal variant="rise"` pour les apparitions. Aucun `zinc-*`/`dark:`. Contenu conforme AC #4 : tutoiement bienveillant, jamais culpabilisant, **aucun numéro d'urgence**, rien de « à venir ».
- **Task 3 — CTA chat** : `Button asChild` + `Link href="/discussion-anonyme"`, libellé « Pose ta question, anonymement » + phrase « Anonyme, sans inscription. Une vraie personne du lycée te répond — pas un robot. » Le chat est présenté comme complément (même mécanisme, même anonymat pour ce profil), jamais comme substitut ni réservé aux victimes.
- **⚠️ Checkpoint Charles en attente** (seule sous-tâche non cochée, Task 4) : validation humaine requise avant clôture définitive sur (1) le contenu éditorial des 4 repères, (2) le libellé de nav « Aider un camarade » (provisoire depuis la 4.1), (3) le libellé du CTA « Pose ta question, anonymement ». Le code est complet et vérifié ; ces points sont éditoriaux et relèvent d'une décision produit.

#### Ajustement post-implémentation (demande Fab, 2026-07-16) — illustrations reprises du Wix

- La story prévoyait une page « texte d'abord » (aucun asset dédié). **Demande de Fab : ajouter les images, reprises du site Wix d'origine.** Deux illustrations inédites ont été récupérées sur les pages Wix « Dangers du Harcèlement » et « Discussion Anonyme » (CDN `static.wixstatic.com`, téléchargées en local — aucune dépendance à Wix) :
  - `public/camarade-illustration.jpeg` (2048×1152) — adolescent pensif à la fenêtre (persona Léo qui se demande comment réagir) → **section intro**, en grille 2 colonnes texte + image (pattern de la section mission de `/`), `Reveal` « wipe » depuis la gauche, `alt=""` (décorative), `priority` (au-dessus de la ligne de flottaison).
  - `public/chat-anonyme-illustration.jpeg` (1024×1024) — bulle de dialogue + cadenas (anonymat du chat) → **section CTA finale**, passée en grille 2 colonnes image + texte (pattern de la section « pourquoi » de `/`), `Reveal` « wipe » depuis la droite, `alt=""` (décorative).
- Images restantes du Wix non retenues : couloir vide (ambiance froide, moins adaptée au ton rassurant), ado en bibliothèque (portrait redondant avec l'ado à la fenêtre), bannière double bulle (déjà évoquée par la bulle-cadenas). Comme en 4.1 : visuels générés par IA repris du Wix, remplaçables par Charles sans changer le code (mêmes noms de fichiers).
- Vérifié après ajustement : `npm run lint` OK, `npm run build` OK (`/camarade-exclu` toujours statique ○), serveur prod local : les deux images rendues et servies via `next/image` (HTTP 200).

#### Ajustement post-implémentation (demande Fab, 2026-07-16) — navigation mobile

- **Bug signalé par Fab : sur mobile, aucun lien vers `/camarade-exclu`.** Les liens texte du header étaient en `hidden sm:inline` (choix 4.1 « mobile = logo + CTA pour éviter l'encombrement ») → sous 640px, « Aider un camarade » était inatteignable, en échec de l'AC #2 / FR-13 (« accessible depuis la navigation principale ») sur téléphone.
- Correctif dans `components/site-header.tsx` : **menu mobile** via le composant `Sheet` de la fondation 4.0 (installé en 4.0 précisément pour la navigation). Bouton hamburger (`Button variant="ghost" size="icon"`, icône `MenuIcon` de `lucide-react` — déjà dépendance du projet via shadcn) visible uniquement sous `sm` (`sm:hidden`), ouvrant un panneau latéral droit avec les deux liens de nav (gros touch targets, `aria-current` conservé). Chaque lien est enveloppé dans `SheetClose asChild` → le panneau se ferme au choix d'un lien. `SheetTitle` en `sr-only` (exigence a11y Radix Dialog), `aria-label="Ouvrir le menu"` sur le déclencheur. Le CTA « Parler à quelqu'un » reste visible dans la barre sur mobile, inchangé.
- Vérifié : `npm run lint` OK ; dans Chrome — le hamburger est `display:none` en desktop (liens texte inchangés), le panneau s'ouvre avec les deux liens, la page courante est marquée, et le clic sur « Discussion anonyme » ferme le panneau et navigue vers le chat (intact). (Émulation viewport mobile non disponible dans le navigateur piloté — logique de breakpoints Tailwind `sm:` vérifiée dans le DOM ; contrôle visuel final sur téléphone par Fab.)

### File List

- `app/camarade-exclu/page.tsx` — **nouveau** : section dédiée au deuxième profil (FR-13) ; sections intro et CTA illustrées (ajustement Fab).
- `public/camarade-illustration.jpeg` — **ajouté** (repris du Wix, page « Dangers du Harcèlement ») : ado pensif à la fenêtre, section intro.
- `public/chat-anonyme-illustration.jpeg` — **ajouté** (repris du Wix, page « Discussion Anonyme ») : bulle + cadenas, section CTA.
- `components/site-header.tsx` — **modifié** : prop `alwaysVisible` (mode `sticky` sans hero) + `aria-current` via `usePathname()` + menu mobile `Sheet` (hamburger sous `sm`, ajustement Fab).
- `_bmad-output/implementation-artifacts/4-2-section-dediee-au-deuxieme-profil.md` — story (frontmatter `baseline_commit`, tasks, Dev Agent Record, Change Log, Status).
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — statut de la story (`in-progress` → `review`).

## Change Log

- 2026-07-16 : Implémentation Story 4.2 — création de `app/camarade-exclu/page.tsx` (section deuxième profil FR-13) et ajout de la prop `alwaysVisible` à `SiteHeader` (header visible sur les pages sans hero). Build + lint OK, parcours vérifié au navigateur. Statut → review. Checkpoint éditorial Charles en attente.
- 2026-07-16 : Ajustement (Fab) — illustrations reprises du site Wix d'origine : `camarade-illustration.jpeg` (intro, grille texte+image) et `chat-anonyme-illustration.jpeg` (CTA finale, grille image+texte), via `next/image` + `Reveal` « wipe », `alt=""` décoratives. Build + lint OK, images servies vérifiées.
- 2026-07-16 : Ajustement (Fab) — menu mobile dans `SiteHeader` : sous `sm`, les liens texte étaient masqués et « Aider un camarade » inatteignable sur téléphone (échec AC #2 sur mobile). Hamburger + panneau `Sheet` (fondation 4.0) avec les deux liens de nav, fermeture au clic, `aria-current` et `SheetTitle` sr-only. Lint OK, ouverture/navigation vérifiées dans Chrome.
