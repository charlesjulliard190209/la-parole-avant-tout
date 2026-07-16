---
baseline_commit: e53f2f6cc40f624ccb16d6dd681ad513b24291c0
---

# Story 4.1: Point d'entrée clair vers le chat

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève arrivant sur la page d'accueil du site,
I want atteindre le chat anonyme fonctionnel en un clic,
so that je peux commencer à écrire immédiatement, sans chercher et sans me demander si l'outil « existe vraiment ».

> Story de **vitrine (FR-12)**. Elle remplace la page d'accueil actuelle — encore le **template Next.js par défaut** (`app/page.tsx` : « To get started, edit the page.tsx file ») — par une vraie page d'accueil qui met le chat anonyme en avant comme fonctionnalité centrale. Elle s'appuie sur la fondation design posée par la Story 4.0 (shadcn/ui + direction « Doux & rassurant »). **Périmètre = page d'accueil seule.** La section « deuxième profil » (FR-13, route `/camarade-exclu`) est la **Story 4.2** : ne pas la construire ni créer de lien vers elle ici (la route n'existe pas encore → un lien produirait un 404).
>
> **Ambition validée par Charles (2026-07-16) : « landing complète ».** La page ne se limite pas à un bouton : elle présente l'association (qui, mission, message phare « S'exprimer est le premier pas vers le changement »), PUIS met le chat comme action centrale. Elle **reprend et adapte le contenu réel du site Wix actuel** (repris ci-dessous, Dev Notes § Contenu source), en le branchant sur le vrai chat désormais fonctionnel. Le site Wix est intégralement remplacé (AD-1).

## Acceptance Criteria

1. **La page d'accueil est une landing complète qui met le chat en avant comme fonctionnalité centrale.** `app/page.tsx` ne contient plus rien du template Next.js par défaut (plus de logos Next/Vercel, plus de « To get started, edit the page.tsx file », plus de liens vers `vercel.com`/`nextjs.org`). Elle présente : (a) un **hero** avec le **logo de l'association** + le nom du site, une phrase d'identité (« deux élèves… engagés contre le harcèlement scolaire ») et le CTA vers le chat ; (b) le **message phare** « S'exprimer est le premier pas vers le changement » ; (c) au moins une **section de contenu** (mission / pourquoi libérer la parole), adaptée du contenu Wix (Dev Notes § Contenu source). Le chat reste l'action centrale et visible d'emblée.
2. **Un élève atteint le chat fonctionnel en un clic maximum depuis la page d'accueil.** Il existe un appel à l'action (CTA) principal, visible sans défilement (au-dessus de la ligne de flottaison sur mobile et desktop), qui pointe vers `/discussion-anonyme`. Un seul clic depuis `/` amène l'élève sur le chat fonctionnel (la page `/discussion-anonyme` existante : choix de mode + saisie de message). *[Source: PRD FR-12, epics.md Story 4.1]*
3. **Aucune page ne présente le chat comme « à venir » ou promotionnel.** Le texte de la page d'accueil décrit le chat comme **disponible maintenant** (« écris ici », « parler à quelqu'un »), jamais comme « bientôt », « à venir », « prochainement » ou un teaser marketing. *[Source: PRD FR-12 conséquence testable #2]*
4. **La page utilise la fondation « Doux & rassurant » (Story 4.0), pas de style ad hoc.** Le rendu s'appuie sur les tokens sémantiques (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, accent `primary`/terracotta) et les composants `components/ui/*` (au minimum `Button` pour le CTA ; `Card` si pertinent). La typo utilise `font-heading` (Nunito) pour les titres, Nunito Sans (défaut) pour le corps. **Aucune couleur `zinc-*` codée en dur** ni palette parallèle sur cette nouvelle page.
5. **Le CTA est accessible.** Le lien vers le chat est un vrai élément navigable (`<Link>` Next.js rendu comme `<a href="/discussion-anonyme">`), avec un libellé explicite (pas « cliquez ici »), un contraste texte/fond suffisant, et un focus visible au clavier. La page reste lisible et l'action atteignable au clavier.
6. **Aucune régression.** `npm run build` et `npm run lint` passent. Les parcours existants (`/discussion-anonyme`, `/organisateurs/**`, `/styleguide`) s'affichent comme avant — cette story ne touche qu'`app/page.tsx` (et, seulement si nécessaire, un composant de présentation dédié à la page d'accueil). Le `layout.tsx` global n'est **pas** modifié (pas d'ajout de header/nav global : ça impacterait le chat et les organisateurs — hors périmètre et risque de régression).

## Tasks / Subtasks

- [x] **Task 1 — Intégrer les assets images (déjà présents dans `public/`)** (AC: #1)
  - [x] **Logo** `public/logo.png` (PNG 1051×392, bulle de dialogue bleu marine + magenta) : afficher via `next/image` (`import Image from "next/image"`) avec `alt="La Parole Avant Tout"`, `width`/`height` respectant le ratio ~2.68:1 (ex. header : hauteur ~44px → largeur ~118px). Voir Dev Notes § Images.
  - [x] **Illustrations de section** `public/mission-illustration.jpg` (1024×1024, groupe d'ados qui discutent en cercle → section **mission**) et `public/pourquoi-illustration.jpg` (1024×1024, adolescente seule/pensive → section **« pourquoi »**) : afficher via `next/image`, **`alt=""`** (décoratives), recadrées proprement (`object-cover`, coins arrondis `rounded-[var(--radius)]` pour rester cohérent avec la direction douce). Les sources sont carrées → cadrer selon la mise en page choisie. **NB : les fichiers réels sont en `.jpeg` (pas `.jpg`) — code branché sur `/mission-illustration.jpeg` et `/pourquoi-illustration.jpeg`.**
  - [x] (Optionnel) Supprimer les SVG résiduels du template devenus inutiles (`public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`). **Fait.**
- [x] **Task 2 — Réécrire `app/page.tsx` : header + hero + CTA** (AC: #1, #2, #4, #5)
  - [x] Réécrire `app/page.tsx` entièrement (Server Component, aucun accès données — voir Dev Notes § Contraintes archi). Supprimer les logos Next/Vercel, les textes et liens du template.
  - [x] **Header léger** (local à la page, PAS dans `layout.tsx`) : logo à gauche, et le CTA « chat » à droite. Pas de menu multi-pages (les autres pages n'existent pas encore — voir Dev Notes § Portée).
  - [x] **Hero** : logo/nom + titre chaleureux (`font-heading`, `text-foreground`), phrase d'identité adaptée du Wix (« Nous sommes deux élèves du Lycée Français Charles de Gaulle engagés contre le harcèlement scolaire… espace de parole solidaire, sûr et bienveillant »), et le CTA principal au-dessus de la ligne de flottaison.
  - [x] **CTA** via le composant `Button` rendu comme lien : `<Button asChild size="lg"><Link href="/discussion-anonyme">…</Link></Button>` (le `Button` supporte `asChild` via `Slot`). Importer `Link` depuis `next/link`. Libellé orienté action, ex. « Parler à quelqu'un » / « Parler ici » (Wix utilise « Parler ici ») — à valider avec Charles. **Choisi : « Parler à quelqu'un » (à confirmer au checkpoint).**
  - [x] Styler exclusivement avec les tokens sémantiques de la fondation 4.0 (`bg-background`, `text-foreground`, `text-muted-foreground`, `primary`…). **Aucun** `zinc-*`/`bg-white`/`dark:bg-black` en dur.
- [x] **Task 3 — Sections de contenu (landing complète), au présent, sans « à venir »** (AC: #1, #3)
  - [x] Reprendre le **message phare** « S'exprimer est le premier pas vers le changement. Ici, ta parole est précieuse, protégée et écoutée avec la plus grande bienveillance. »
  - [x] Section **mission** (adaptée de « Libérer la Parole pour Combattre l'Isolement ») + section **« Pourquoi est-il crucial de libérer ta parole ? »** — textes en Dev Notes § Contenu source. Peuvent s'appuyer sur `Card`/`Separator` de la fondation ou rester en simple prose stylée aux tokens.
  - [x] Ton : présent, tutoiement, doux et direct (public sensible). Cohérent avec la voix du chat (`app/discussion-anonyme/page.tsx`). **Rien de « bientôt/à venir »** — le chat est disponible maintenant. Ne pas mentionner la section « camarade exclu » (FR-13, Story 4.2 — route inexistante).
- [x] **Task 4 — Vérifier non-régression et build** (AC: #6)
  - [x] `npm run build` OK, `npm run lint` OK (voir Dev Notes § Build : variables d'env Supabase requises pour builder localement).
  - [x] Inspection visuelle : `/` affiche la nouvelle vitrine (chaude, arrondie, terracotta), le CTA amène en **un clic** sur `/discussion-anonyme` qui reste fonctionnel.
  - [x] Vérifier que `/discussion-anonyme`, `/organisateurs/connexion`, `/styleguide` sont inchangés.
  - [x] **Checkpoint Charles** : montrer la page d'accueil (direction visuelle + libellé du CTA) avant de clôturer. **Captures présentées à Fab/Charles ; validation finale humaine au review.**

### Review Findings

Revue de code (2026-07-16, workflow `bmad-code-review`, 3 couches parallèles : Blind Hunter, Edge Case Hunter, Acceptance Auditor). **Verdict : conformité forte aux 6 AC** ; corrections ciblées côté accessibilité et robustesse des îlots clients. 1 décision, 5 patchs, 5 différés, 2 écartés.

- [x] [Review][Decision] Lien « Aider un camarade » → `/camarade-exclu` = 404 en production — route 4.2 pas encore implémentée ; les 3 couches le pointent comme lien mort sur un site sensible. **Résolu : Fab reconfirme « garder tel quel » (404 temporaire assumé jusqu'à la Story 4.2, décision tracée). Aucun changement de code.** [components/site-header.tsx:14,77]
- [x] [Review][Patch] En-tête masqué contient des éléments focusables au clavier (`aria-hidden` + tabbables) — ajouter `inert` quand masqué (relevé par les 3 couches). **Corrigé : `inert={!visible}` sur le `<header>` ; focus clavier vérifié comme bloqué (activeElement reste `body`).** [components/site-header.tsx:50]
- [x] [Review][Patch] Reveal : flash au chargement (FOUC) des blocs déjà visibles + risque de non-révélation si le bloc dépasse le viewport rogné. **Corrigé : `threshold: 0` + décision `animate`/`visible` dans le callback de l'observer (rAF `animate` supprimé) → les blocs déjà visibles s'affichent direct sans flash, révélation robuste même si le bloc dépasse le viewport.** [components/reveal.tsx:64-78]
- [x] [Review][Patch] `<header>` / `<footer>` imbriqués dans `<main>` → perte des landmarks `banner` / `contentinfo`. **Corrigé : `SiteHeader` et `footer` sortis de `<main>` (fragment racine) → landmarks rétablis.** [app/page.tsx:19,165]
- [x] [Review][Patch] Variant wipe dépend d'un `relative` fourni par l'appelant (couplage fragile). **Corrigé : `relative` forcé en dur sur le conteneur externe wipe (`cn("relative", className)`).** [components/reveal.tsx:122]
- [x] [Review][Patch] Images wipe en échec de chargement → cadre vide révélé. **Corrigé : fond de repli sur l'interne (`bg-muted` sur fond crème, `bg-card` sur la bande muted pour le contraste).** [app/page.tsx:99,121]
- [x] [Review][Defer] `prefers-reduced-motion` lu une seule fois, non réactif au changement en cours de session [components/reveal.tsx:56] — deferred, amélioration mineure
- [x] [Review][Defer] Constantes CTA (`CHAT_HREF` / `CTA_LABEL`) dupliquées entre `page.tsx` et `site-header.tsx` (risque de divergence) [app/page.tsx:13-14] — deferred, mineur
- [x] [Review][Defer] Nav secondaire invisible < 640px et sans JS (« Aider un camarade » inatteignable sur mobile/sans JS ; le CTA chat reste atteignable via le hero rendu serveur) [components/site-header.tsx:70-81] — deferred, mineur
- [x] [Review][Defer] En-tête `fixed` sans `scroll-padding-top` (pas d'ancre interne aujourd'hui) [components/site-header.tsx:52] — deferred, préventif
- [x] [Review][Defer] Page tenant sans défilement → en-tête jamais révélé (cas rare sur une landing) [components/site-header.tsx:36] — deferred, cas rare

Écartés (bruit / décidé ailleurs) : `alt=""` sur les illustrations mission/pourquoi (décision décorative documentée) ; flash de l'en-tête si la page est chargée déjà défilée (cosmétique 1 frame, atténué par le patch Reveal).

## Dev Notes

### Objectif produit (pourquoi cette story)

FR-12 : le site Wix actuel présente la « Discussion Anonyme » comme du texte promotionnel. On remplace ça par l'**accès réel au chat**, mis en avant comme fonctionnalité centrale, atteignable en un clic. Le chat lui-même (`/discussion-anonyme`) est **déjà construit et fonctionnel** (Epic 1) — cette story ne touche pas au chat, elle construit **la porte d'entrée** vers lui. [Source: prd.md §4.7 + FR-12 ; epics.md#Epic 4]

### Contenu source (site Wix actuel, relevé le 2026-07-16) — base éditoriale

Le site Wix `charlesjulliard19.wixsite.com/la-parole-avant-tout` (page Accueil) fournit le contenu de référence à **adapter** (pas forcément verbatim ; le ton Wix est parfois « markety » — le rendre plus direct/tutoyé est bienvenu, mais préserver l'esprit et le message phare). Le Wix est intégralement remplacé (AD-1).

- **Nav Wix** : `Accueil · Discussion Anonyme · Dangers du Harcèlement` + bouton **« Chat anonyme »**. → Dans notre site : « Discussion Anonyme » = notre chat `/discussion-anonyme` ; « Dangers du Harcèlement » est une page Wix **sans équivalent construit** (≠ FR-13 « camarade exclu ») — **ne pas** la recréer ni y lier ici.
- **H1** : « La Parole Avant Tout »
- **Intro (hero)** : « Nous sommes deux élèves du Lycée Français Charles de Gaulle engagés contre le harcèlement scolaire. Partage ton vécu avec nous en toute confiance ; nous t'offrons ici un espace de parole solidaire, sûr et bienveillant. »
- **CTA Wix** : « Parler ici » (pointe vers le chat).
- **Message phare** : « S'exprimer est le premier pas vers le changement. Ici, ta parole est précieuse, protégée et écoutée avec la plus grande bienveillance. »
- **Section mission — « Libérer la Parole pour Combattre l'Isolement »** : « La mission de La Parole Avant Tout est de briser le silence qui entoure le harcèlement scolaire. Notre plateforme offre aux élèves un refuge anonyme et sécurisé pour s'exprimer librement. Nous croyons fermement qu'en mettant des mots sur les maux, nous pouvons ensemble construire un environnement scolaire plus sain et plus solidaire. »
- **Section — « Pourquoi est-il crucial de libérer ta parole ? »** : « Garder ses émotions pour soi peut devenir un poids immense. À La Parole Avant Tout, nous croyons que chaque ressenti mérite d'être entendu. S'exprimer, c'est briser le cercle de l'intimidation et reprendre confiance en soi. Nous sommes là pour t'écouter sans jugement et t'aider à naviguer sereinement à travers tes interactions sociales, car mettre des mots sur ce que tu vis est la première étape vers un quotidien plus léger et sécurisé. »
- **Footer Wix** : logo + « La Parole Avant Tout © 2026 ». (Un footer simple est optionnel pour cette story.)

> Nuance FR-12 : l'ancien texte « Notre plateforme offre aux élèves un refuge anonyme et sécurisé… » était **promotionnel** tant qu'aucun chat n'existait derrière. Il devient **vrai** dès lors que chaque promesse est reliée au chat réel (CTA en un clic). C'est exactement l'objectif de FR-12 : remplacer la promesse par l'accès.

### Images

**Les 3 assets sont déjà téléchargés dans `public/`** (récupérés du Wix le 2026-07-16). Tous en local → pas de config `next.config` `remotePatterns`, aucune dépendance à Wix. Les afficher via `next/image`.

| Fichier | Dimensions | Contenu | Usage | `alt` |
| --- | --- | --- | --- | --- |
| `public/logo.png` | 1051×392 (PNG) | Bulle de dialogue bleu marine + magenta « La Parole Avant Tout » | Header (et footer si présent) | `"La Parole Avant Tout"` |
| `public/mission-illustration.jpg` | 1024×1024 | Groupe d'ados divers discutant en cercle dans une cour | Section **mission** | `""` (décorative) |
| `public/pourquoi-illustration.jpg` | 1024×1024 | Adolescente seule/pensive en classe (isolement) | Section **« pourquoi »** | `""` (décorative) |

- **Logo** : le logo intègre déjà le nom du site — décider si le titre texte « La Parole Avant Tout » est répété à côté (risque de redondance) ou si le logo suffit dans le header. **Attention couleurs** : le logo est bleu marine + magenta, ce **ne sont pas** les couleurs de la fondation « Doux & rassurant » (terracotta/sauge/crème). C'est l'identité de marque existante — le laisser tel quel, ne pas le recoloriser. Si le contraste sur fond crème gêne, en discuter avec Charles (possible variante de logo, ou original vectoriel/SVG de meilleure qualité).
- **Illustrations** : purement décoratives (aucun texte alternatif à l'origine) → `alt=""`. Sources **carrées 1024×1024** → cadrer avec `object-cover` selon la mise en page. Ce sont des visuels **générés par IA** repris du Wix ; Charles pourra les remplacer plus tard par ses propres visuels sans changer le code (mêmes noms de fichiers).

### Contraintes architecture (garde-fous)

- **FR-12 vit dans `app/page.tsx`, gouverné par AD-1** (un seul projet Next.js, plus de Wix). C'est la localisation canonique de la vitrine. [Source: ARCHITECTURE-SPINE.md#Capability Map — « Point d'entrée site (FR-12) | app/page.tsx | AD-1 » ; #Arborescence source ligne `page.tsx  # vitrine (FR-12)`]
- **Server Component, aucune donnée.** La page d'accueil est purement présentationnelle : pas de Supabase, pas de Server Action, pas de `cookies()`, pas d'`await`. Ne touche à aucune frontière d'écriture (AD-3) ni accès données (AD-4). Garder `app/page.tsx` en Server Component synchrone (comme le template actuel : `export default function Home()`).
- **Couche Présentation** de l'archi : `app/**/page.tsx` + composants sous `components/`. Si tu extrais un morceau de présentation, place-le sous `components/` (pas de dossier `app/_components` ad hoc). Pour une page aussi simple, tout inline dans `app/page.tsx` est acceptable — ne sur-architecture pas (NFR-1). [Source: ARCHITECTURE-SPINE.md#Design Paradigm]
- **Conventions de nommage** : composants React en PascalCase, fichiers en kebab-case. [Source: ARCHITECTURE-SPINE.md#Consistency Conventions]
- **NFR-1 (maintenable par 2 débutants)** : page simple, lisible, sans abstraction inutile. Réutiliser la fondation, ne rien réinventer. [Source: epics.md#NonFunctional NFR-1]

### Réutiliser la fondation 4.0 — NE PAS réinventer le style

La Story 4.0 (statut `review`, présente dans l'arbre de travail, **non encore commitée**) a livré :

- **Tokens « Doux & rassurant »** dans `app/globals.css` (light + dark, mode sombre `media`-based). Tokens sémantiques disponibles : `background` (crème `#FBF7F2`), `foreground` (brun `#3A322C`), `primary` (terracotta `#D98A6A`) / `primary-foreground` (blanc), `secondary` (sauge), `muted`/`muted-foreground`, `card`, `border`, `ring`, `--radius: 0.9rem`. Utilise-les via les classes Tailwind sémantiques : `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary text-primary-foreground`, `bg-card`, `border-border`. [Source: 4-0-fondation-design-shadcn.md § Palette ; app/globals.css]
- **Typo** : `--font-sans` = Nunito Sans (corps, appliqué par défaut au `body`), `--font-heading` = Nunito. Pour les titres, utilise la classe utilitaire **`font-heading`** (exposée par `@theme inline` dans `globals.css`). Voir l'usage dans `app/styleguide/page.tsx` (`className="font-heading text-4xl font-extrabold text-foreground"`). [Source: app/layout.tsx ; app/globals.css ; app/styleguide/page.tsx]
- **Composants** sous `components/ui/` : `button`, `card`, `input`, `textarea`, `label`, `separator`, `badge`, `sheet`. Importables via `@/components/ui/...`. Pour cette story tu auras surtout besoin de `Button` (et éventuellement `Card`). [Source: 4-0-fondation-design-shadcn.md § File List]

**`Button` supporte `asChild`** (pattern Radix `Slot`) : `components/ui/button.tsx` fait `const Comp = asChild ? Slot.Root : "button"`. C'est le moyen propre de rendre un lien stylé comme un bouton, sans imbriquer `<button>` dans `<a>` :

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild size="lg">
  <Link href="/discussion-anonyme">Parler à quelqu&apos;un</Link>
</Button>
```

Variantes `Button` disponibles : `default` (terracotta), `secondary`, `outline`, `ghost`, `destructive`, `link` ; tailles `sm`/`default`/`lg`. Le CTA principal = `default` (accent primary). [Source: components/ui/button.tsx ; app/styleguide/page.tsx]

### État actuel du fichier à remplacer

- **`app/page.tsx`** — À RÉÉCRIRE INTÉGRALEMENT. C'est aujourd'hui le template `create-next-app` : logos `/next.svg` `/vercel.svg`, titre « To get started, edit the page.tsx file. », liens externes vers `vercel.com`/`nextjs.org`, styles en `bg-zinc-50`/`dark:bg-black` codés en dur. **Rien de ce contenu ne doit subsister** (AC #1). Note : `next/image` **reste utilisé**, mais pour afficher le **logo de l'association** (Task 1), pas les logos Next/Vercel du template. La 4.0 avait volontairement laissé ce fichier intact (« sa refonte = Story 4.1 »). [Source: app/page.tsx ; 4-0-fondation-design-shadcn.md § État actuel — « app/page.tsx — NE PAS TOUCHER dans cette story […] sa refonte = Story 4.1 »]
- **`app/layout.tsx`** — NE PAS MODIFIER. Il fournit déjà `<html lang="fr">`, les fonts (Nunito Sans/Nunito), `<body className="min-h-full flex flex-col">`, et la `metadata` globale (`title: "La Parole Avant Tout"`). La page d'accueil s'insère comme `children` dans ce `<body>` flex-col. Optionnel : tu peux exporter une `metadata` locale dans `app/page.tsx` pour préciser le titre/description de l'accueil, mais ce n'est pas requis par les AC. [Source: app/layout.tsx]
- **Ne pas toucher** : `app/discussion-anonyme/**`, `app/organisateurs/**`, `app/styleguide/**`, `app/globals.css`, `lib/*`, `components/ui/*`.

### Cohérence avec le chat existant (ton & mise en page)

- Le layout du site place `children` dans un `<body className="min-h-full flex flex-col">`. Les pages existantes utilisent un `<main className="flex flex-1 …">` pour occuper la hauteur. Reprends ce pattern (`<main className="flex flex-1 flex-col …">`) pour une page d'accueil qui remplit l'écran proprement. [Source: app/discussion-anonyme/page.tsx ligne `<main className="flex flex-1 flex-col items-center …">`]
- **Voix** à reprendre depuis le chat : tutoiement, présent, rassurant, anti-robot. Ex. existant : « Tu peux écrire ici sans donner ton nom, ton email, ni rien qui permette de te reconnaître. Une vraie personne du lycée va lire ce que tu écris et te répondre — pas un robot. » La page d'accueil peut reprendre l'esprit (voire une version courte) de ce message. [Source: app/discussion-anonyme/page.tsx lignes 124-128]
- Le nom public du site est **« La Parole Avant Tout »** (metadata layout). Utilise ce nom, pas le `project_name` interne (`la-parole-contre-tous`). [Source: app/layout.tsx metadata]

### Portée : ce qui n'est PAS dans cette story

- **Un header léger est OK, mais seulement LOCAL à la page d'accueil** (logo + CTA chat), **pas dans `layout.tsx`** (un header global impacterait chat + organisateurs — régression, hors périmètre).
- **Pas de navigation multi-pages / menu de site.** Le Wix a un menu (Accueil, Discussion Anonyme, Dangers du Harcèlement) : ne pas le reproduire — « Dangers du Harcèlement » n'a pas d'équivalent construit, et une vraie nav de site n'a de sens qu'à partir de deux destinations publiques (pertinente en **Story 4.2**, quand `/camarade-exclu` existera). Le seul lien sortant de l'accueil est le CTA vers `/discussion-anonyme`.
- **Pas de section FR-13 / `/camarade-exclu`** ni lien vers elle (route inexistante = 404, régression). C'est la Story 4.2.
- **Pas de reskin des parcours existants** (chat, organisateurs) — hors périmètre, comme en 4.0.

### Build & vérification

- **Pas de framework de tests** dans le projet (ni Vitest/Jest/Playwright) — cohérent avec toutes les stories précédentes. Vérification = **build + lint + inspection visuelle**. Ne pas introduire de framework de test (hors périmètre, NFR-1). [Source: 4-0-fondation-design-shadcn.md § Testing]
- **`npm run build` exige des variables d'env Supabase** même si l'accueil ne les utilise pas : d'autres pages valident l'env au chargement via `lib/env.ts#requireEnv`. Sans `.env.local`, le build échoue sur `Missing SUPABASE_URL` — condition **pré-existante**, sans rapport avec cette story. Builder avec des variables factices si besoin (`SUPABASE_URL`, etc.), comme documenté en 4.0. [Source: 4-0-fondation-design-shadcn.md § Debug Log]
- Vérifier le rendu réel de `/` (mood chaud/terracotta, CTA visible sans scroll, un clic → `/discussion-anonyme`) et la non-régression de `/discussion-anonyme`, `/organisateurs/connexion`, `/styleguide`.
- **Checkpoint Charles** : valider la direction visuelle de l'accueil et le libellé du CTA avant de clôturer.

### Intelligence story précédente (4.0) — à réutiliser

- La 4.0 a **délibérément gardé** le mode sombre en `media`-based (`prefers-color-scheme`) pour ne pas casser les parcours existants stylés en `dark:`. La nouvelle page d'accueil, si elle utilise les tokens sémantiques, hérite automatiquement du bon comportement clair/sombre — **ne pas** réintroduire un `@custom-variant dark` ni des `dark:bg-black` en dur. [Source: 4-0-fondation-design-shadcn.md § Completion Notes — décision mode sombre]
- Les parcours existants stylent encore « à la main » en `zinc`/`dark:` (non migrés, volontairement). **Ne pas s'en inspirer** pour la nouvelle page : la vitrine est du **code neuf** → elle doit utiliser d'emblée les tokens sémantiques + composants shadcn (c'est justement ce que la fondation permet). [Source: 4-0-fondation-design-shadcn.md § Conventions de style existantes]
- `Sheet` est le seul composant client (`"use client"`, Radix Dialog) ; les autres (`Button`, `Card`…) sont utilisables directement en Server Component. La page d'accueil n'a besoin d'aucun îlot client. [Source: 4-0-fondation-design-shadcn.md § shadcn sur ce stack]

### Git / travail récent

- Dernier commit : `2d2d9fe` (Story 3.1 auth organisateurs). La **Story 4.0 n'est pas encore commitée** : ses fichiers (`components/`, `lib/utils.ts`, `components.json`, `app/globals.css`, `app/layout.tsx`, `app/styleguide/`) sont en modifié/non-suivi dans l'arbre de travail. La Story 4.1 **construit dessus** : ces fichiers sont ta base, ne les défais pas. [Source: git status ; 4-0-fondation-design-shadcn.md § File List]
- Pattern de branche : travail sur `epic-4-site-public`. Convention de commit du repo : `Story X.Y: <résumé> (…)`.

### Project Structure Notes

- Seul fichier modifié attendu : **`app/page.tsx`** (réécriture complète). Optionnellement un composant de présentation dédié sous `components/` **seulement si** la page grossit — sinon, tout inline (page simple = 1 fichier, plus lisible pour 2 débutants). Ne pas créer `app/_components/`.
- Aligné avec l'arborescence de référence (`app/page.tsx  # vitrine (FR-12)`). Aucune nouvelle route, aucune migration, aucune Server Action. [Source: ARCHITECTURE-SPINE.md#Arborescence source]

### References

- [Source: _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md#FR-12] — point d'entrée clair vers le chat, conséquences testables (un clic max, pas de « à venir »).
- [Source: _bmad-output/planning-artifacts/prds/prd-la-parole-contre-tous-2026-07-06/prd.md#4.7] — réorganisation du site autour du chat.
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4 — Story 4.1] — user story + AC BDD.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-la-parole-contre-tous-2026-07-08/ARCHITECTURE-SPINE.md#AD-1] — un seul site Next.js, vitrine FR-12 dans `app/page.tsx`.
- [Source: _bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md#Capability Map] — « Point d'entrée site (FR-12) | app/page.tsx | AD-1 ».
- [Source: _bmad-output/implementation-artifacts/4-0-fondation-design-shadcn.md] — fondation design réutilisée (tokens, composants, typo, décisions).
- [Source: app/page.tsx] — template Next.js par défaut à remplacer.
- [Source: app/layout.tsx] — layout global (fonts, `<body>` flex-col, metadata) — ne pas modifier.
- [Source: app/discussion-anonyme/page.tsx] — chat cible du CTA + voix/ton de référence.
- [Source: app/styleguide/page.tsx] — exemples d'usage de la fondation (`font-heading`, `Button`, `Card`, tokens).
- [Source: components/ui/button.tsx] — `Button` avec `asChild` (rendre un `Link` comme bouton).
- [Source: site Wix charlesjulliard19.wixsite.com/la-parole-avant-tout, page Accueil, relevé 2026-07-16] — contenu éditorial de référence (intro, message phare, sections mission / « pourquoi libérer ta parole »), à adapter.
- [Source: public/logo.png, public/mission-illustration.jpg, public/pourquoi-illustration.jpg] — assets téléchargés du Wix le 2026-07-16 (logo + 2 illustrations de section), prêts à l'emploi. Voir Dev Notes § Images.
- Décision Charles/Fab (2026-07-16) : ambition « landing complète » (présenter l'association + chat central) ; conserver le logo ; reprendre les 2 illustrations Wix (remplaçables plus tard par Charles).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, workflow bmad-dev-story)

### Debug Log References

- `npm run lint` → OK (aucune erreur/warning).
- `npm run build` → OK (Next.js 16.2.10, Turbopack). `/` compile en route **statique** (○). Routes existantes intactes : `/discussion-anonyme` (ƒ), `/organisateurs`, `/organisateurs/connexion` (○), `/styleguide` (○). `.env.local` présent → pas de blocage `Missing SUPABASE_URL`.
- Inspection visuelle sur le serveur de dev (`localhost:3000`) : hero (logo + nom + phrase d'identité + CTA) entièrement au-dessus de la ligne de flottaison ; bandes de fond alternées (crème / sauge clair `accent` / crème / crème sombre `muted`) ; illustrations recadrées proprement (`object-cover`, arrondi) ; clic sur le CTA → `/discussion-anonyme` fonctionnel (choix de mode + saisie) en **un clic**, chat inchangé.

### Completion Notes List

- **Écart doc corrigé** : la story désignait les illustrations en `.jpg`, mais les fichiers réellement présents dans `public/` sont en **`.jpeg`** (`mission-illustration.jpeg`, `pourquoi-illustration.jpeg`). Le code pointe sur les vrais noms `.jpeg`.
- `app/page.tsx` **entièrement réécrit** : plus aucun résidu du template create-next-app (logos Next/Vercel, « To get started… », liens `vercel.com`/`nextjs.org`, `bg-zinc-50`/`dark:bg-black`). Server Component synchrone, purement présentationnel (aucun accès données/Supabase/cookies).
- **Landing complète** : header local (initialement statique logo + CTA → **devenu « révélé au scroll » suite à la demande de Fab**, voir Ajustements ci-dessous), hero (logo + nom + phrase d'identité + CTA principal), bande « message phare », section **mission** (texte + illustration), section **« pourquoi »** (illustration + texte), CTA final, footer simple (logo + « © 2026 »).
- **Fondation 4.0 uniquement** : tokens sémantiques (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-accent`, `bg-muted`, `border-border`, `primary`), titres en `font-heading`, CTA via le composant `Button` (`asChild` + `next/link`). **Aucun `zinc-*` / `bg-white` / `dark:bg-black` en dur.** Le mode clair/sombre est hérité automatiquement des tokens (pas de `dark:` manuel).
- **Accessibilité CTA (AC #5)** : 3 CTA, tous rendus en vrais `<a href="/discussion-anonyme">` (vérifié via l'arbre d'accessibilité), libellé explicite « Parler à quelqu'un » (jamais « cliquez ici »), focus clavier visible (anneau `focus-visible:ring` du `Button`), navigation en un clic.
- **Ton (AC #3)** : présent + tutoiement partout, chat décrit comme **disponible maintenant** (« écris-nous dès maintenant », « une vraie personne du lycée te répond — pas un robot »). Aucune mention « bientôt / à venir / prochainement », aucun teaser marketing, aucune mention de la section « camarade exclu » (Story 4.2).
- **A11y images** : logo du header porte `alt="La Parole Avant Tout"` ; logo du hero en `alt=""` (décoratif, le nom est déjà en texte juste en dessous → pas d'annonce en double) ; illustrations en `alt=""` (décoratives).
- **Nettoyage** : SVG résiduels du template supprimés (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) — ils n'étaient référencés que par l'ancien `page.tsx`.
- **Hors périmètre respecté** : `layout.tsx` non modifié (pas de header/nav global) ; parcours chat/organisateurs non re-skinnés. *(Exception ultérieure décidée par Fab : un lien vers `/camarade-exclu` a finalement été ajouté dans le header — 404 temporaire assumé jusqu'à la 4.2, voir Ajustements ci-dessous.)*
- **Point à valider au review (Charles)** : libellé du CTA (« Parler à quelqu'un » vs « Parler ici » du Wix) et direction visuelle générale.

#### Ajustement post-implémentation (demande Fab, 2026-07-16)

- **En-tête « révélé au scroll »** : remplacement du header statique par un nouvel îlot client `components/site-header.tsx`. Il est **masqué en haut de page** (pour laisser le hero centré — logo + nom — bien visible) et **glisse depuis le haut dès que le logo du hero quitte le viewport**. Détection via `IntersectionObserver` sur un repère `#hero-logo-sentinel` placé sous le logo du hero. Re-masqué automatiquement quand on remonte. Comportement vérifié visuellement (haut → masqué / scroll → visible / retour haut → masqué).
- **Navigation du header** (choix Fab) : logo cliquable → accueil (`/`), lien texte « Discussion anonyme » → `/discussion-anonyme`, lien « Aider un camarade » → `/camarade-exclu`, bouton CTA « Parler à quelqu'un » → `/discussion-anonyme`. Liens texte affichés à partir de `sm:` (mobile = logo + CTA pour éviter l'encombrement).
- ⚠️ **Dérogation assumée au périmètre 4.1** : la story interdisait tout lien vers `/camarade-exclu` (route 4.2 inexistante → 404). **Décision explicite de Fab (2026-07-16)** : mettre le lien direct malgré tout, avec **404 temporaire assumé** jusqu'à la livraison de la Story 4.2. `npm run build` et `npm run lint` **restent verts** (Next.js ne valide pas les cibles de `<Link>` au build ; le 404 n'existe qu'au runtime au clic). Le libellé « Aider un camarade » est provisoire — à confirmer avec le cadrage final de la 4.2.

#### Apparition au scroll (demande Fab, 2026-07-16)

- Reprise de l'effet de l'ancien Wix : au défilement, le **texte monte** (fondu + léger translate) puis l'**image apparaît en balayage (« wipe »)** — pas un simple fondu. Composant réutilisable `components/reveal.tsx` (variants `rise` / `wipe`, `delay` pour échelonner texte→image). Appliqué aux sections message phare, mission, « pourquoi » et CTA final ; le hero (déjà au-dessus de la ligne de flottaison) n'est pas animé.
- **Accessibilité** : respect de `prefers-reduced-motion` (si l'utilisateur réduit les animations → contenu affiché immédiatement, sans mouvement) — important pour un public sensible.
- **Piège technique résolu** : un élément réduit à une aire nulle par `clip-path` n'est jamais détecté « visible » par l'`IntersectionObserver` posé sur lui → le wipe ne se déclenchait pas. Correctif : on **observe un conteneur externe non clippé** et on applique le `clip-path` (et le cadre/arrondi, via `innerClassName`) sur un enfant, pour que le cadre apparaisse **avec** l'image et non en cadre vide avant.

### File List

- `app/page.tsx` — **modifié** (réécriture complète : template Next.js → vitrine FR-12 ; header statique remplacé par `<SiteHeader />` + repère `#hero-logo-sentinel` ; sections/images enveloppées dans `<Reveal>`).
- `components/site-header.tsx` — **ajouté** (îlot client `"use client"` : en-tête révélé au scroll via `IntersectionObserver` ; logo + nav 4.2 + CTA).
- `components/reveal.tsx` — **ajouté** (îlot client : apparition au scroll — « wipe » balayage `clip-path` pour les images, « rise » montée douce pour le texte ; respecte `prefers-reduced-motion`).
- `public/next.svg` — **supprimé** (résidu template).
- `public/vercel.svg` — **supprimé** (résidu template).
- `public/file.svg` — **supprimé** (résidu template).
- `public/globe.svg` — **supprimé** (résidu template).
- `public/window.svg` — **supprimé** (résidu template).
- `public/logo.png`, `public/mission-illustration.jpeg`, `public/pourquoi-illustration.jpeg` — assets déjà présents (non modifiés), désormais référencés par la page.

## Change Log

| Date | Version | Description |
| --- | --- | --- |
| 2026-07-16 | 0.1 | Story 4.1 implémentée : `app/page.tsx` réécrit en vitrine « landing complète » (FR-12) sur la fondation 4.0 ; CTA en un clic vers `/discussion-anonyme` ; nettoyage des SVG du template ; build + lint OK, non-régression vérifiée. Statut → review. |
| 2026-07-16 | 0.2 | Ajustement (Fab) : en-tête « révélé au scroll » (`components/site-header.tsx`, îlot client) masqué en haut / affiché quand le logo du hero sort du viewport ; nav logo→accueil + « Discussion anonyme » + « Aider un camarade » (`/camarade-exclu`, 404 temporaire assumé jusqu'à la 4.2) + CTA. Build + lint OK. |
| 2026-07-16 | 0.3 | Ajustement (Fab) : apparition au scroll des sections/images (`components/reveal.tsx`, îlot client) — texte en montée douce, images en « wipe » (balayage `clip-path`), échelonné texte→image ; respect de `prefers-reduced-motion`. Build + lint OK. |
| 2026-07-16 | 0.4 | Revue de code appliquée (5 patchs) : `inert` sur en-tête masqué (a11y), logique Reveal durcie (`threshold:0`, plus de flash/FOUC), `header`/`footer` sortis de `<main>` (landmarks), `relative` forcé sur wipe, fond de repli image. Décision « lien 4.2 → 404 assumé » reconfirmée par Fab. 5 findings mineurs différés (`deferred-work.md`). Build + lint OK. Statut → done. |
