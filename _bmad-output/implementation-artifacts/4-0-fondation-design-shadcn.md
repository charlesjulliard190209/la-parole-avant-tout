---
baseline_commit: 2d2d9fe16dc3d209b9c3634bc7584a850ac357ab
---

# Story 4.0: Fondation design (shadcn/ui + direction « Doux & rassurant »)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a équipe de développement (Charles et Basile),
I want mettre en place shadcn/ui et une direction visuelle chaleureuse validée,
so that les pages du site reposent sur un jeu de composants cohérent et bienveillant, sans réinventer le style à chaque écran.

> Story d'**habilitation (enabler)** — pas rattachée à une FR. Elle pose le socle d'interface sur lequel les Stories 4.1 (vitrine, FR-12) et 4.2 (section deuxième profil, FR-13) s'appuieront. Décision de Charles (2026-07-16) : rendre le site moins austère **avant** de construire les pages publiques. Périmètre validé = **fondation seule** : on n'applique aucun reskin aux parcours existants (chat élève, organisateurs) dans cette story ; ils seront repris plus tard, story par story.

## Acceptance Criteria

1. **shadcn/ui est initialisé sur le projet existant** : `components.json` présent, `lib/utils.ts` exporte `cn()` (clsx + tailwind-merge), et l'init n'a rien cassé (`npm run build` et `npm run lint` passent).
2. **La direction « Doux & rassurant » est appliquée en tokens de thème** dans `app/globals.css` : fond crème, texte brun profond, accent **terracotta doux** (primary), secondaire **vert sauge**, radius large (coins arrondis), typo humaniste. La palette de référence exacte est en Dev Notes (§ Palette).
3. **Un jeu de composants de base réutilisables est installé** via la CLI shadcn, au minimum ceux dont 4.1/4.2 auront besoin : `button`, `card`, `input`, `textarea`, `label`, `separator`, `badge`, et un composant de navigation mobile (`sheet`). Chaque composant vit sous `components/ui/`.
4. **Une page `/styleguide` existe pour la validation visuelle par Charles** : elle affiche la palette (pastilles de couleur nommées), les niveaux de typo (h1→h4, corps, légende), et chaque composant installé dans ses variantes principales. Cette page n'est **liée depuis aucune navigation publique** (accès direct par URL uniquement) — c'est un outil interne, pas une page du site.
5. **Aucune régression visuelle sur les parcours existants** : `app/discussion-anonyme/**` (chat élève) et `app/organisateurs/**` s'affichent comme avant. La fondation ajoute des tokens et des composants disponibles ; elle ne réécrit pas ces pages.
6. **L'ajout reste dans la stack verrouillée (AD-2) et maintenable par deux développeurs débutants (NFR-1)** : seules les dépendances standard de shadcn sont ajoutées (Radix UI, `class-variance-authority`, `tailwind-merge`, `clsx`, `lucide-react`). Aucun autre framework, backend ou service tiers. shadcn est du code de composants que l'on possède dans le dépôt, pas un service — conforme à AD-2 (qui verrouille le serveur/hébergement).

## Tasks / Subtasks

- [x] **Task 1 — Initialiser shadcn/ui sur le projet** (AC: #1, #6)
  - [x] Lancer `npx shadcn@latest init`. Répondre : base color = **Stone** (gris chaud, cohérent avec « Doux & rassurant »), CSS variables = oui.
  - [x] Vérifier que l'init a détecté Tailwind v4 (pas de `tailwind.config.js` généré ; les tokens vont dans `app/globals.css`) et l'alias `@/*` existant. Voir Dev Notes § shadcn sur ce stack.
  - [x] Si l'install échoue sur un conflit de peer-deps React 19, relancer avec `npm install ... --legacy-peer-deps` (la CLI shadcn le gère normalement seule — voir Dev Notes).
  - [x] Confirmer les fichiers créés : `components.json`, `lib/utils.ts` (fonction `cn`), et les blocs de tokens dans `app/globals.css`.
  - [x] Vérifier les alias de `components.json` : `components → @/components`, `ui → @/components/ui`, `lib → @/lib`, `utils → @/lib/utils`.
- [x] **Task 2 — Appliquer la palette « Doux & rassurant » aux tokens** (AC: #2)
  - [x] Dans `app/globals.css`, remplacer les valeurs de tokens générées par shadcn par la palette de référence (Dev Notes § Palette) : `--background`, `--foreground`, `--primary`/`--primary-foreground` (terracotta), `--secondary`/`--secondary-foreground` (sauge), `--card`, `--muted`/`--muted-foreground`, `--border`, `--ring`, `--radius`.
  - [x] Régler `--radius` sur une valeur large (arrondi généreux) — voir Palette.
  - [x] Décider du sort du mode sombre : conserver un jeu de tokens `.dark` cohérent (chaud) pour ne rien casser, **sans** viser un vrai design dark abouti pour le MVP public (voir Dev Notes § Mode sombre). Ne pas supprimer le bloc dark existant sans l'avoir remplacé proprement.
- [x] **Task 3 — Typo humaniste** (AC: #2)
  - [x] Dans `app/layout.tsx`, remplacer/compléter la police par une typo humaniste chaleureuse via `next/font/google` (recommandé : **Nunito Sans** ou **Nunito** pour le corps ; une police d'accent optionnelle pour les titres — voir Dev Notes § Typo). Câbler la variable CSS de la font sur `--font-sans` dans `globals.css`.
  - [x] Conserver le pattern `next/font` existant (variable CSS + classe sur `<html>`), ne pas charger de font via `<link>` externe.
- [x] **Task 4 — Installer les composants de base** (AC: #3)
  - [x] `npx shadcn@latest add button card input textarea label separator badge sheet`
  - [x] Vérifier que chaque composant est bien sous `components/ui/` et importable via `@/components/ui/...`.
- [x] **Task 5 — Créer la page `/styleguide` de validation** (AC: #4)
  - [x] Créer `app/styleguide/page.tsx` (Server Component simple, aucun accès données).
  - [x] Afficher : (a) les pastilles de palette avec nom + rôle (background, foreground, primary/terracotta, secondary/sauge, muted, border) ; (b) l'échelle typographique (h1→h4, paragraphe, légende) ; (c) chaque composant installé dans ses variantes clés (`Button` : default/secondary/outline/ghost + tailles ; `Card` ; `Input`/`Textarea`/`Label` ; `Badge` ; `Separator` ; un `Sheet` déclenché par un bouton).
  - [x] Ne poser **aucun lien** vers `/styleguide` depuis `app/page.tsx`, `layout.tsx` ou toute navigation.
- [x] **Task 6 — Vérifier non-régression et build** (AC: #1, #5)
  - [x] `npm run build` et `npm run lint` passent sans erreur.
  - [x] Ouvrir en local `/`, `/discussion-anonyme`, `/organisateurs/connexion` : rendu inchangé par rapport à avant la story.
  - [x] Ouvrir `/styleguide` : la palette et les composants s'affichent correctement, coins arrondis et couleurs chaudes visibles.
  - [x] **Checkpoint validation Charles** : montrer `/styleguide` avant de considérer la story terminée (c'est l'objet même de la story : valider la direction).

### Review Findings

_Revue de code adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) — 2026-07-16. Bilan : 3 décisions, 2 patchs, 7 rejetés comme bruit._

- [x] [Review][Decision→Patch] **Contraste terracotta insuffisant (WCAG AA)** — Décision Charles : assombrir la terracotta en gardant la teinte. Appliqué : `--primary` `#d98a6a`→`#b35a38` (≈4.7:1 avec blanc), `--muted-foreground` `#7a6e63`→`#6b6157` (≈5.6:1), `--ring` aligné. **Validation visuelle finale par Charles sur `/styleguide` requise.** [app/globals.css]
- [x] [Review][Decision] **Remap global du radius reskine les parcours existants** — Décision Charles : **accepter l'arrondi partout** (effet assumé de la fondation, cohérent avec « Doux & rassurant »). Aucun changement de code.
- [x] [Review][Decision] **AC #6 — dépendances hors liste autorisée** — Décision Charles : **accepter + documenter l'écart**. `shadcn` déplacé en `devDependencies` ; note « Conforme à AC #6 » corrigée en déviation assumée (radix-nova). [package.json / Dev Agent Record]
- [x] [Review][Patch] **Déplacer `shadcn` de `dependencies` vers `devDependencies`** — appliqué. [package.json]
- [x] [Review][Patch] **Nettoyer la redondance de câblage de la police** — règle `body { font-family }` supprimée (gérée par `html { @apply font-sans }`). [app/globals.css]

## Dev Notes

### Contexte architecture & contraintes

- **AD-1 (un seul projet Next.js)** et **AD-2 (stack verrouillée : Next.js + Supabase + Vercel)** : shadcn/ui n'est **pas** un nouveau framework ni un service — c'est du code de composants React copié dans le dépôt (`components/ui/`) que l'équipe possède et modifie. Ses dépendances (Radix, cva, tailwind-merge, clsx, lucide-react) sont des libs front standard. Conforme à AD-2, qui verrouille le **serveur/hébergement**, pas les libs UI. [Source: ARCHITECTURE-SPINE.md#AD-1, #AD-2]
- **NFR-1 (maintenable par 2 débutants)** : shadcn colle à cet objectif — on lit et modifie des composants simples localement plutôt qu'une lib opaque. Ne pas sur-configurer : palette + composants de base, rien de plus. [Source: epics.md#NonFunctional NFR-1]
- **Couche Présentation** de l'archi : `app/**/page.tsx` + `app/**/*.tsx`. Les composants shadcn iront sous `components/ui/` (nouveau dossier à la racine, standard shadcn), importés via l'alias `@/`. [Source: ARCHITECTURE-SPINE.md#Design Paradigm]
- **Convention de nommage** : composants React en PascalCase, fichiers en kebab-case — shadcn respecte déjà ça (`button.tsx` exporte `Button`). [Source: ARCHITECTURE-SPINE.md#Consistency Conventions]

### État actuel du code (fichiers touchés)

- **`app/globals.css`** — MODIFIÉ. État actuel : Tailwind v4 via `@import "tailwindcss"`, un bloc `@theme inline` mappant `--color-background`/`--color-foreground`/`--font-sans`/`--font-mono`, un `:root` avec `--background:#ffffff` / `--foreground:#171717`, et un bloc `@media (prefers-color-scheme: dark)`. À préserver : le mécanisme `@theme inline` + variables de font. À faire : y ajouter/adapter les tokens shadcn (light + dark) avec la palette chaude.
- **`app/layout.tsx`** — MODIFIÉ (Task 3). État actuel : charge `Geist` + `Geist_Mono` via `next/font/google`, expose `--font-geist-sans`/`--font-geist-mono` sur `<html>`, `lang="fr"`, `<body className="min-h-full flex flex-col">`. À préserver : structure `<html>/<body>`, `lang="fr"`, les classes de layout flex, le pattern `next/font`. À changer : la police (Geist → humaniste) et le câblage de `--font-sans`.
- **`app/page.tsx`** — NE PAS TOUCHER dans cette story. C'est encore le template Next.js par défaut (« To get started, edit the page.tsx file ») ; sa refonte = **Story 4.1**, pas ici.
- **`app/styleguide/page.tsx`** — NOUVEAU (Task 5).
- **`components/ui/*`**, **`components.json`**, **`lib/utils.ts`** — NOUVEAUX (générés par shadcn).
- **Ne pas modifier** : `app/discussion-anonyme/**`, `app/organisateurs/**`, `lib/*.ts` existants (session, supabase-server, danger-keywords, etc.).

### Conventions de style existantes (à connaître, pas à refactorer)

Le code actuel style « à la main » en utilitaires Tailwind avec la palette **`zinc`** et des variantes `dark:` (ex. `message-form.tsx` : `rounded-xl border border-zinc-200 ... dark:border-zinc-700`). C'est volontairement laissé tel quel (fondation seule). Les futures stories pourront migrer ces écrans vers les composants shadcn + tokens sémantiques (`bg-card`, `text-foreground`, `border-border`…), mais **pas dans cette story**.

### shadcn sur ce stack (Next 16 + Tailwind v4 + React 19) — points de vigilance

- **Tailwind v4** : la CLI shadcn récente supporte v4. Elle n'écrit **pas** de `tailwind.config.js` (il n'y en a pas et il ne doit pas y en avoir) — les tokens vont dans `app/globals.css` sous forme de variables CSS, avec le pattern `@theme inline` / `:root` / `.dark` et un `@custom-variant dark`. Vérifier que l'init n'introduit pas de `tailwind.config.js` parasite.
- **Alias `@/*`** : déjà configuré (les imports actuels utilisent `@/lib/...`). `components.json` doit refléter cet alias. Si la CLI demande le chemin des composants, garder `@/components`.
- **React 19 + npm** : possible avertissement de peer-deps. La CLI shadcn gère généralement seule (propose `--legacy-peer-deps`). Si un `add` bloque, relancer l'install sous-jacent avec `--legacy-peer-deps`. Ne pas downgrader React.
- **Server vs Client Components** : les composants shadcn de base (button, card, input, label, separator, badge) sont utilisables en Server Components. `sheet` (Radix Dialog) est un Client Component (`"use client"`) — normal, l'utiliser dans un îlot client. La page `/styleguide` peut rester Server Component et intégrer le `sheet` via un petit wrapper client si besoin.
- **`cn()`** : utilitaire fourni par l'init dans `lib/utils.ts` (merge de classes). L'utiliser pour toute composition de classes conditionnelles dans les composants.

### Palette « Doux & rassurant » (référence validée par Charles, 2026-07-16)

Valeurs de référence (hex). shadcn v4 génère souvent des tokens en `oklch` — soit convertir en oklch, soit utiliser directement le hex dans les variables CSS (les deux fonctionnent). Mapper sur les tokens sémantiques shadcn :

| Rôle (token shadcn) | Couleur | Hex |
| --- | --- | --- |
| `--background` | crème | `#FBF7F2` |
| `--foreground` | brun profond | `#3A322C` |
| `--card` / `--popover` | blanc chaud | `#FEFCFA` |
| `--card-foreground` | brun profond | `#3A322C` |
| `--primary` | terracotta doux | `#D98A6A` |
| `--primary-foreground` | blanc chaud | `#FFFFFF` |
| `--secondary` | vert sauge | `#8AA391` |
| `--secondary-foreground` | brun profond | `#3A322C` |
| `--muted` | crème sombre | `#F0E9E1` |
| `--muted-foreground` | brun grisé | `#7A6E63` |
| `--accent` | sauge clair | `#DCE6DE` |
| `--accent-foreground` | brun profond | `#3A322C` |
| `--border` / `--input` | beige | `#E7DDD2` |
| `--ring` | terracotta doux | `#D98A6A` |
| `--radius` | arrondi large | `0.9rem` |

Ce ne sont pas des valeurs figées au pixel près — l'objectif est le **mood** (chaud, arrondi, non-clinique, apaisant). Si une nuance rend mal à l'écran (contraste insuffisant du texte sur les boutons terracotta, par ex.), ajuster la luminance en gardant la teinte. Viser un contraste texte/fond suffisant pour la lisibilité (public sensible).

> **Ajustement contraste (revue de code 2026-07-16)** — appliqué au titre de l'autorisation ci-dessus : `--primary` `#D98A6A` → **`#B35A38`** (blanc sur terracotta passait de ~2.7:1 à **≈4.7:1**, seuil WCAG AA 4.5:1) et `--muted-foreground` `#7A6E63` → **`#6B6157`** (~4.1 → **≈5.6:1**). `--ring` aligné sur la nouvelle primary. Teintes conservées, mood plus « rouille profonde » sur les boutons. **À valider visuellement par Charles sur `/styleguide`.**

### Typo humaniste

- **Corps** : recommandé **Nunito Sans** (humaniste, chaleureuse, très lisible) via `next/font/google`. Alternative acceptable : conserver une sans neutre si Nunito Sans rend mal, mais l'esprit visé est « humaniste et douce », pas géométrique/technique comme Geist.
- **Titres (optionnel)** : une police d'accent plus ronde/amicale peut être ajoutée pour les `h1/h2` (ex. **Nunito** en poids gras, ou une police display douce). Garder au plus **deux** familles pour rester simple (NFR-1).
- Câbler la variable de font sur `--font-sans` (utilisée par `@theme inline` → `--font-sans`). Le choix final se valide visuellement sur `/styleguide`.

### Mode sombre

Le `globals.css` actuel a un bloc `prefers-color-scheme: dark`, et les pages existantes utilisent des variantes `dark:`. Pour cette story : **définir un jeu de tokens `.dark` chaud et cohérent** (pour que rien ne casse et que les composants shadcn restent corrects en sombre), **sans** investir dans un design sombre abouti — le site public MVP vise la version claire chaude. Ne pas supprimer le support du sombre à la va-vite (ça toucherait les pages existantes) ; le laisser fonctionnel et neutre.

### Testing

- Pas de framework de tests automatisés dans le projet à ce jour (`package.json` n'a ni Vitest, ni Jest, ni Playwright) — cohérent avec les stories précédentes, vérifiées manuellement.
- **Vérification de cette story = build + lint + inspection visuelle** :
  - `npm run build` OK, `npm run lint` OK.
  - `/styleguide` affiche palette + composants (validation Charles).
  - `/`, `/discussion-anonyme`, `/organisateurs/connexion` : rendu inchangé (non-régression).
- Ne pas introduire de framework de test dans cette story (hors périmètre, NFR-1).

### Project Structure Notes

- Nouveau dossier `components/ui/` à la racine (standard shadcn), aligné avec la couche Présentation de l'archi. Ne remplace pas l'arborescence source de référence (ARCHITECTURE-SPINE.md § Arborescence source) : il l'**enrichit** d'un socle UI partagé, ce que l'archi ne détaillait pas mais n'interdit pas.
- `lib/utils.ts` (nouveau, `cn()`) cohabite avec les `lib/*.ts` métier existants — même dossier `lib/`, rôle différent (utilitaire UI vs domaine). Pas de conflit.
- Aucune Server Action, aucun accès données dans cette story : `/styleguide` est purement présentationnel. On ne touche donc à aucune frontière d'écriture (AD-3) ni accès Supabase (AD-4).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4] — Story 4.0 (ajoutée 2026-07-16), Stories 4.1/4.2 (FR-12, FR-13) qui consommeront ce socle.
- [Source: _bmad-output/planning-artifacts/epics.md#NonFunctional] — NFR-1 (maintenable par 2 débutants).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md#AD-1] — un seul projet Next.js.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md#AD-2] — stack cœur verrouillée (portée serveur/hébergement).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md#Consistency Conventions] — nommage PascalCase/kebab-case.
- [Source: app/globals.css] — état Tailwind v4 actuel (à enrichir, pas remplacer).
- [Source: app/layout.tsx] — pattern `next/font`, structure `<html>/<body>`.
- [Source: app/discussion-anonyme/message-form.tsx] — convention de style zinc/dark actuelle (laissée telle quelle).
- Décision produit : direction « Doux & rassurant » + périmètre fondation seule, validés par Charles le 2026-07-16.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, dev-story workflow)

### Debug Log References

- `npm run build` échoue avec `Missing SUPABASE_URL environment variable` **si** aucun `.env.local` n'est présent — condition **pré-existante** (les pages `discussion-anonyme`/`organisateurs` valident l'env au chargement via `lib/env.ts#requireEnv`), sans rapport avec cette story. Build relancé avec des variables d'env factices → **compile OK, TypeScript OK, 8 routes générées** (dont `/styleguide` en statique).
- Vérification visuelle faite via le serveur `next dev` déjà lancé sur le port 3000 (HMR a pris les nouveaux fichiers) : `/styleguide` → 200, `/` → 200. `/discussion-anonyme` et `/organisateurs/connexion` renvoient 500 sur ce serveur car il tourne **sans** `.env.local` (besoin Supabase pré-existant), pas à cause de la fondation.

### Completion Notes List

- **shadcn/ui initialisé** sur le stack existant (Next 16 + Tailwind v4 + React 19) via `npx shadcn init -b radix -p nova`. La CLI récente ne propose plus « Stone » comme base color en flag (choix par preset désormais) ; sans importance ici car **toute la palette est réécrite** en Task 2. Détection correcte : Next.js, Tailwind v4 (pas de `tailwind.config.js` généré ✅), alias `@/*`. `components.json` avec les bons alias (`@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`), `lib/utils.ts` expose `cn()`.
- **Dépendances ajoutées** : `radix-ui`, `class-variance-authority`, `tailwind-merge`, `clsx`, `lucide-react` (libs front standard conformes à AC #6). **Déviation assumée vs AC #6** (revue de code + décision Charles 2026-07-16) : le style shadcn `radix-nova` a aussi introduit `tw-animate-css` (désormais la lib d'animation standard de shadcn) et `shadcn` + `@import "shadcn/tailwind.css"`, qui couplent le build au package `shadcn`. Écart accepté pour l'instant (build OK, aucun service tiers runtime) ; `shadcn` déplacé en `devDependencies` (inutile au runtime prod). À réévaluer si l'on veut un jour « posséder » entièrement le CSS sans dépendre du package.
- **Décision mode sombre (écart documenté vs formulation « tokens `.dark` »)** : l'init shadcn avait introduit `@custom-variant dark (&:is(.dark *))`, basculant le `dark:` en **class-based**. Or les 8 fichiers existants utilisent des variantes `dark:` pilotées par l'OS (`prefers-color-scheme`, défaut Tailwind v4). Garder le class-based aurait **cassé le rendu sombre des parcours existants** (AC #5). J'ai donc rétabli le comportement **media-based** (suppression du `@custom-variant`, tokens sombres sous `@media (prefers-color-scheme: dark)`), ce qui honore l'intention de la story (« ne rien casser », § Mode sombre) tout en donnant un jeu de tokens sombres chaud et cohérent.
- **Aucun impact couleur sur les parcours existants** : vérifié qu'aucun d'eux n'utilise de token sémantique (`bg-background`, `text-foreground`, etc.) — ils stylent en `zinc` codé en dur. La recolorisation des tokens ne change donc que la **police globale** (Geist → Nunito Sans), qui est l'objectif même de la fondation (Dev Notes § État actuel : « Geist → humaniste »).
- **Typo** : `Nunito Sans` (corps, `--font-sans`) + `Nunito` (titres, utilitaire `font-heading`) via `next/font/google`, câblées sur `--font-nunito-sans`/`--font-nunito`. Pattern `next/font` conservé, `lang="fr"` et layout flex préservés.
- **8 composants** installés sous `components/ui/` : `button`, `card`, `input`, `textarea`, `label`, `separator`, `badge`, `sheet`. `sheet` isolé dans un îlot client (`app/styleguide/sheet-demo.tsx`), la page `/styleguide` reste Server Component.
- **`/styleguide`** : palette nommée (pastilles + rôle + hex), échelle typo h1→h4 + corps + légende, et chaque composant dans ses variantes clés. `robots: noindex`, **aucun lien** depuis la navigation. Validé visuellement (captures) : mood chaud, arrondi, terracotta/sauge/crème conformes ; `Sheet` s'ouvre et se ferme correctement.
- **Non touché** (conforme au périmètre « fondation seule ») : `app/page.tsx`, `app/discussion-anonyme/**`, `app/organisateurs/**`, `lib/*.ts` métier.
- ⏳ **Checkpoint restant** : validation visuelle finale de la direction par Charles sur `/styleguide` (objet même de la story).

### File List

**Nouveaux :**
- `components.json` (config shadcn)
- `lib/utils.ts` (`cn()`)
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/label.tsx`
- `components/ui/separator.tsx`
- `components/ui/badge.tsx`
- `components/ui/sheet.tsx`
- `app/styleguide/page.tsx`
- `app/styleguide/sheet-demo.tsx`

**Modifiés :**
- `app/globals.css` (tokens palette « Doux & rassurant » light + dark, mapping fonts, mode sombre media-based)
- `app/layout.tsx` (Geist → Nunito Sans + Nunito)
- `package.json` / `package-lock.json` (dépendances shadcn)
- `_bmad-output/implementation-artifacts/4-0-fondation-design-shadcn.md` (frontmatter, checkboxes, Dev Agent Record, Status)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (statut de la story)

## Change Log

| Date | Version | Description | Auteur |
| --- | --- | --- | --- |
| 2026-07-16 | 1.0 | Implémentation Story 4.0 : init shadcn/ui, palette « Doux & rassurant » (light + dark chaud), typo humaniste (Nunito Sans/Nunito), 8 composants de base, page `/styleguide`. Build + lint OK. Mode sombre rétabli en media-based pour préserver les parcours existants (AC #5). | Amelia (dev-story) |
