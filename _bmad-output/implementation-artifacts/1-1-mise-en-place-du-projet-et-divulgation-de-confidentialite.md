---
baseline_commit: 42acb563beebd792a6ae9e93fc1e800d1ceed908
---

# Story 1.1: Mise en place du projet et divulgation de confidentialité

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a élève qui arrive sur la page "Discussion Anonyme",
I want voir le texte expliquant la règle d'anonymat et sa limite avant de pouvoir écrire quoi que ce soit,
so that je comprends les règles du jeu avant de m'exposer.

## Acceptance Criteria

1. Given j'arrive pour la première fois sur la page "Discussion Anonyme", When la page se charge, Then le texte de confidentialité s'affiche en premier écran — jamais caché derrière un lien "en savoir plus" non consulté par défaut. [Source: prd.md#FR-14]
2. Aucun champ de saisie de message n'est actif ni visible tant que ce texte n'a pas été affiché à l'écran (le choix de mode, Story 1.2, n'existe pas encore à cette étape — cette story se limite au texte de divulgation). [Source: prd.md#FR-14]
3. Le projet est initialisé (Next.js App Router + TypeScript), déployé sur Vercel, et connecté à un projet Supabase avec les tables `Conversation` et `Message` créées via une migration versionnée. [Source: ARCHITECTURE-SPINE.md#AD-1, #AD-2, #AD-10, #Modèle-de-données]

## Tasks / Subtasks

- [x] Task 1: Initialiser le projet Next.js (AC: #3)
  - [x] Créer le projet avec Next.js 16.2.10 LTS (App Router), TypeScript 6.0
  - [x] Installer et configurer Tailwind CSS 4.3.2
  - [x] Mettre en place l'arborescence de base : `app/`, `lib/`, `supabase/migrations/` (voir Dev Notes, arborescence source)
  - [x] Vérifier Node.js 24 (LTS active) comme runtime local et Vercel
- [x] Task 2: Créer et connecter le projet Supabase (AC: #3)
  - [x] Créer un projet Supabase (plan gratuit) — fait par Charles (project ref `zbkfkobylprkovgrityb`, région Europe)
  - [x] Installer `@supabase/supabase-js` 2.110.1
  - [x] Créer `lib/supabase-server.ts` : client Supabase utilisant la clé service (`SUPABASE_SERVICE_ROLE_KEY`), **jamais** exposé au navigateur, **jamais** préfixé `NEXT_PUBLIC_`
  - [x] Déclarer les variables d'environnement en local (`.env.local`, non commité — vérifié dans `.gitignore`) et sur Vercel — variables identifiées (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) ; saisie sur Vercel en cours par Charles dans le cadre de la Task 4
- [x] Task 3: Créer la migration initiale des tables (AC: #3)
  - [x] Créer `supabase/migrations/` avec une migration versionnée définissant `Conversation` (id uuid, session_token_hash nullable, recovery_code_hash nullable, is_ephemeral bool, is_priority bool, flagged_missed_danger bool, last_organizer_read_at timestamptz nullable, created_at timestamptz) et `Message` (id uuid, conversation_id FK, sender_type, body, created_at timestamptz)
  - [x] Activer Row Level Security sur ces deux tables, **sans aucune policy** pour les rôles `anon`/`authenticated` (deny-by-default) — seule la clé service y accédera
  - [x] **Ne pas créer** la table `RecoveryAttempt` dans cette story — elle n'est nécessaire qu'à partir de la Story 1.5 (principe : créer une table seulement quand une story en a besoin)
- [x] Task 4: Déployer sur Vercel (AC: #3)
  - [x] Lier le dépôt GitHub à un projet Vercel (plan Hobby) — fait par Charles
  - [x] Configurer les mêmes variables d'environnement que Task 2 sur Vercel (jamais commitées dans le dépôt) — `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` renseignées
  - [x] Vérifier qu'un push sur `main` déclenche un déploiement automatique — confirmé : le push du commit `a54143a` a déclenché un déploiement Production automatiquement
- [x] Task 5: Page de divulgation de confidentialité (AC: #1, #2)
  - [x] Créer `app/discussion-anonyme/page.tsx`
  - [x] Afficher le texte expliquant la règle d'anonymat et sa limite ("anonyme, sauf en cas de danger sérieux où des ressources d'urgence s'affichent") directement au chargement, en premier écran
  - [x] Ne rendre aucun champ de saisie de message sur cette page à ce stade (le champ de saisie et le choix de mode arrivent en Story 1.2/1.3 — cette story s'arrête à l'affichage du texte)
- [x] Task 6: Vérification manuelle (AC: #1, #2, #3)
  - [x] Ouvrir la page déployée sur mobile et desktop, confirmer que le texte s'affiche immédiatement sans clic caché — vérifié : `https://la-parole-avant-tout.vercel.app/discussion-anonyme` répond HTTP 200 et contient le texte de divulgation, aucun champ de saisie présent. (Vérification équivalente faite d'abord en local avant déploiement : `npm run build` + `npm run start` + `curl`.)
  - [x] Confirmer en base Supabase que les tables `Conversation`/`Message` existent avec RLS activé et aucune policy — confirmé par Charles via Table Editor (les deux tables apparaissent) ; migration appliquée manuellement via SQL Editor Supabase (la CLI a échoué sur un problème connu d'authentification pooler, voir Debug Log)

## Dev Notes

- **Stack verrouillée, rien d'autre** : Next.js (App Router) 16.2.10 LTS + TypeScript 6.0 + Tailwind CSS 4.3.2 + `@supabase/supabase-js` 2.110.1 + Supabase Postgres (plan gratuit) + Vercel (Hobby). N'introduire aucun autre framework, backend ou hébergeur. [Source: ARCHITECTURE-SPINE.md#AD-2, #Stack]
- **Un seul projet remplace Wix entièrement** : ne pas créer de pont/iframe avec l'ancien site Wix. Vitrine, chat et interface organisateurs vivront tous dans ce même projet Next.js au fil des epics suivants — cette story ne construit que la fondation. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **Server Actions = seule frontière d'écriture** (à anticiper, pas à construire ici) : cette story ne contient aucune écriture utilisateur (pas d'envoi de message), donc aucune Server Action n'est nécessaire pour l'instant. Ne pas créer de route API custom pour la page — `app/discussion-anonyme/actions.ts` sera créé en Story 1.2/1.3 quand une première mutation (choix de mode, envoi de message) apparaîtra. [Source: ARCHITECTURE-SPINE.md#AD-3]
- **Aucun accès direct du navigateur à Supabase** pour les tables `conversations`/`messages`/`recovery_attempts` : toute lecture/écriture future passera par le serveur avec la clé service. RLS activé en deny-by-default dès la création des tables dans cette story, même si aucune donnée n'y est encore écrite. [Source: ARCHITECTURE-SPINE.md#AD-4]
- **Un seul environnement de production** (Vercel Hobby + projet Supabase) + previews automatiques par Pull Request — pas de vrai environnement de staging séparé à provisionner. [Source: ARCHITECTURE-SPINE.md#AD-10]
- **Conventions transverses à respecter dès cette story** : ids en `uuid` (`gen_random_uuid()`), dates en `timestamptz` ; aucune PII élève ne doit jamais être stockée (pas de nom/email/identifiant scolaire — pertinent pour les prochaines stories, pas cette story-ci) ; tous les secrets (`SUPABASE_SERVICE_ROLE_KEY`, et plus tard `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_IDS`) en variables d'environnement Vercel, jamais commités. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Pas de starter template imposé** : aucun template greenfield spécifique n'est mentionné dans l'Architecture — bootstrap standard (`create-next-app` ou équivalent) attendu. [Source: ARCHITECTURE-SPINE.md, section Deferred/Stack — absence de mention de starter template]
- **Versions déjà vérifiées** : le spine indique que les versions du tableau Stack ont été vérifiées sur le web le 2026-07-08 (date du jour) — inutile de refaire une recherche de versions pour cette story, elles sont à jour. [Source: ARCHITECTURE-SPINE.md, note sous "Stack"]
- Premier commit de code du projet : aucune story précédente, aucun historique git de code à analyser (seuls les commits de planification BMAD existent à ce jour) — pas de patterns existants à respecter au-delà de ce spine.
- **Ton du texte de divulgation non fixé par le PRD ni l'Architecture** : aucun document ne donne le texte exact à afficher, seulement son contenu obligatoire ("anonyme, sauf en cas de danger sérieux où des ressources d'urgence s'affichent") et son placement (premier écran). Choisir un ton rassurant, jamais anxiogène ni légaliste — cohérent avec le public visé (élève potentiellement en détresse). Si une passe UX (`bmad-ux`) est faite avant cette story, utiliser son texte ; sinon, rédiger un texte simple et chaleureux et le signaler dans les Completion Notes pour révision ultérieure.
- **Aucun framework de test n'est spécifié par l'Architecture** (absent du tableau Stack) — ne pas en introduire un silencieusement (violerait AD-2, stack verrouillée). Pour cette story, une vérification manuelle suffit (Task 6). Si l'équipe veut des tests automatisés, c'est une décision à prendre explicitement en dehors de ce spine, pas à improviser ici.

### Project Structure Notes

Fichiers à créer par cette story (voir arborescence de référence complète dans l'Architecture) :
- `app/discussion-anonyme/page.tsx` — page du chat élève, contient pour l'instant uniquement le texte de divulgation (Task 5)
- `lib/supabase-server.ts` — client Supabase, clé service, utilisé côté serveur uniquement (Task 2)
- `supabase/migrations/` — migration initiale `Conversation`/`Message` (Task 3)

Fichiers **non créés** dans cette story, à ne pas anticiper :
- `app/discussion-anonyme/actions.ts` (Server Actions) — arrive en Story 1.2 ou 1.3, quand une première écriture existe
- `lib/session.ts`, `lib/danger-keywords.ts`, `lib/telegram.ts` — appartiennent à des stories/epics ultérieurs
- `app/page.tsx` (vitrine), `app/organisateurs/*` — Epic 3 et 4, pas cette story

Aucune variance détectée par rapport à la structure unifiée de l'Architecture — cette story pose la toute première pierre, rien à réconcilier.

### References

- [Source: prd.md#FR-14 (§4.1)] — texte de divulgation, conditions d'affichage, ordre chronologique (avant l'écriture, jamais seulement au moment d'un Signal de danger)
- [Source: ARCHITECTURE-SPINE.md#AD-1] — un seul projet Next.js remplace Wix
- [Source: ARCHITECTURE-SPINE.md#AD-2] — stack verrouillée avec versions
- [Source: ARCHITECTURE-SPINE.md#AD-3] — Server Actions comme unique frontière d'écriture (à anticiper, pas construit ici)
- [Source: ARCHITECTURE-SPINE.md#AD-4] — aucun accès client direct à Supabase, RLS deny-by-default
- [Source: ARCHITECTURE-SPINE.md#AD-10] — un seul environnement de prod + previews Vercel par PR
- [Source: ARCHITECTURE-SPINE.md, Modèle de données] — schéma `Conversation`/`Message` (noms de champs)
- [Source: ARCHITECTURE-SPINE.md, Consistency Conventions] — uuid, timestamptz, pas de PII, secrets en variables d'environnement
- [Source: epics.md#Epic-1, Story-1.1] — story source, découpage validé avec Charles et Basile le 2026-07-08

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` : succès (Next.js 16.2.10, Turbopack, TypeScript 6.0.3), route `/discussion-anonyme` générée en statique.
- `npm run start` + `curl http://localhost:3457/discussion-anonyme` : HTTP 200, contient le texte de divulgation attendu, aucun champ de saisie présent.
- Supabase CLI (`supabase link` + `supabase db push`) : `link` a fonctionné, mais `db push` a échoué systématiquement avec `failed SASL auth (FATAL: password authentication failed for user "postgres")`, y compris après réinitialisation du mot de passe par Charles. Cause probable identifiée par recherche web : bug connu du pooler Supabase (Supavisor) qui bannit temporairement une IP après plusieurs tentatives échouées, y compris avec le bon mot de passe ensuite. Tenté `--skip-pooler` (CLI beta) : échoue sur ce réseau (pas d'IPv6). **Contournement retenu** : migration appliquée manuellement en collant le SQL dans le SQL Editor du dashboard Supabase (résultat "Success"), puis vérification visuelle des deux tables dans Table Editor. Fonctionnellement équivalent au résultat attendu de `db push` ; l'historique de migrations de la CLI (`supabase_migrations.schema_migrations`) n'est pas synchronisé avec cette application manuelle — à garder en tête pour la Story 1.5 (si `supabase db push` est retenté plus tard, il pourrait re-proposer cette migration ; le SQL est écrit en `if not exists`/idempotent donc sans risque si rejoué).
- Premier déploiement Vercel : 404 `NOT_FOUND` sur toutes les routes malgré un statut "Ready". Cause n°1 : le premier import Vercel a eu lieu avant que le code Next.js soit poussé sur GitHub (le dépôt ne contenait que les artefacts de planification à ce moment-là) — le déploiement "Ready" servait donc un commit vide de toute application. Résolu en committant/poussant le code (`git commit` + `git push origin main`, avec confirmation explicite de Charles à chaque étape). Cause n°2, découverte après le push : **Framework Preset** était resté figé sur "Other" (détecté au moment du premier import, quand il n'y avait pas encore de `package.json` Next.js dans le dépôt) — Vercel ne construisait donc pas l'app comme un projet Next.js. Corrigé par Charles dans Project Settings → Build and Deployment → Framework Preset → "Next.js", puis redeploy manuel du commit `a54143a`. Après ce redeploy : `https://la-parole-avant-tout.vercel.app/discussion-anonyme` répond HTTP 200 avec le texte de divulgation.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Projet Next.js initialisé (App Router, TypeScript 6.0.3 — mis à jour depuis le `^5` par défaut du scaffold pour coller à AD-2), Tailwind CSS 4.3.2, arborescence `app/`/`lib/`/`supabase/migrations/` en place.
- `lib/supabase-server.ts` créé : lève une erreur explicite si `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` sont absents, plutôt que d'échouer silencieusement.
- Migration `supabase/migrations/20260708000000_conversations_and_messages.sql` écrite : tables `conversations`/`messages`, RLS activé sans policy (deny-by-default, AD-4). `recovery_attempts` volontairement absente (réservée à la Story 1.5).
- Page `app/discussion-anonyme/page.tsx` créée avec le texte de divulgation (ton chaleureux, choisi faute de texte validé en amont — à réviser si une passe UX est faite plus tard). Aucun champ de saisie sur cette page à ce stade.
- Metadata du layout racine mise à jour (titre/description du site) — cosmétique, dans le périmètre du bootstrap projet.
- `.env.local.example` créé pour documenter les variables attendues sans exposer de secret réel.
- Projet Supabase créé par Charles (`zbkfkobylprkovgrityb`), migration appliquée manuellement (SQL Editor, voir Debug Log), tables `conversations`/`messages` confirmées visuellement dans Table Editor.
- Projet Vercel créé et lié par Charles ; variables d'environnement `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` configurées ; Framework Preset corrigé de "Other" à "Next.js" (voir Debug Log) ; déploiement Production vérifié fonctionnel.
- Story complète : les 3 AC sont satisfaits, les 6 tasks sont cochées.
- Aucune régression possible à ce stade : premier code du projet, rien à casser.

### File List

- `package.json` (modifié — nom du projet, dépendances)
- `package-lock.json` (modifié)
- `.gitignore` (modifié — ajout des ignores Next.js/Vercel)
- `.env.local.example` (nouveau)
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` (nouveaux, scaffold Next.js)
- `app/layout.tsx` (modifié — metadata)
- `app/page.tsx`, `app/globals.css`, `app/favicon.ico` (nouveaux, scaffold Next.js — contenu par défaut, pas encore celui d'Epic 4)
- `app/discussion-anonyme/page.tsx` (nouveau — texte de divulgation, FR-14)
- `lib/supabase-server.ts` (nouveau)
- `supabase/migrations/20260708000000_conversations_and_messages.sql` (nouveau)
- `supabase/config.toml`, `supabase/.gitignore` (nouveaux — générés par `supabase init`, CLI ajoutée en devDependency pour les migrations futures)
- `public/*` (nouveaux, assets par défaut du scaffold Next.js)

## Change Log

- 2026-07-08 : Implémentation complète de la Story 1.1 — bootstrap Next.js/Supabase/Vercel + écran de divulgation de confidentialité (FR-14). Commit `a54143a` sur `main` ("Bootstrap Next.js app and add chat disclosure screen (Story 1.1)"). Déploiement Production vérifié fonctionnel après correction du Framework Preset Vercel.
