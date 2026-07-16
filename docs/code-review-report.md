# Rapport d'audit de code — La Parole Avant Tout

**Date :** 2026-07-16
**Périmètre :** état commité au commit `2d2d9fe` (Story 3.1 incluse) — code applicatif (`app/`, `lib/`, `proxy.ts`, `supabase/`, configs) audité contre les artefacts BMAD (`_bmad-output/planning-artifacts/`, `_bmad-output/implementation-artifacts/`).
**Méthode :** revue indépendante en lecture seule, 5 auditeurs parallèles (architecture, qualité, sécurité, état/flux, dépendances) + revue des tests, chaque finding vérifié sur le code réel, puis contre-vérification des findings majeurs par l'orchestrateur.

> ⚠️ **Note de périmètre importante** : pendant l'audit, une Story 4.0 « fondation design shadcn » **non commitée** est apparue dans le working tree (`components/`, `lib/utils.ts`, `app/styleguide/`, `components.json`, modifications de `package.json`/`globals.css`/`layout.tsx`). Ce travail en cours est **exclu du périmètre**. Les fichiers cœur audités (`lib/session.ts`, `lib/supabase-auth.ts`, les deux `actions.ts`, `proxy.ts`, migrations) n'ont pas été modifiés — tous les findings ci-dessous restent valides. Un finding initial « package.json désynchronisé du lockfile » s'est révélé être un artefact de cet état transitoire (le `package.json` actuel est cohérent avec le lock) ; il a été retiré.

---

## 1. Résumé exécutif

Le code est **remarquablement soigné pour un projet développé intégralement via agents** : architecture documentée réellement suivie (AD-3, AD-5, AD-8, AD-9 vérifiés dans le code), RLS Supabase deny-by-default, aucun secret commité (historique git vérifié), cookies élève durcis, aucune faille XSS/CSRF/injection trouvée, TypeScript strict sans `any`, `tsc --noEmit` et `eslint` propres, et chaque compromis technique tracé avec une décision explicite dans `deferred-work.md`.

Trois risques **Élevés** ressortent néanmoins, tous sur le cœur du produit (anonymat + signal de danger) :

1. **Oracle d'énumération des Codes de récupération** : le formulaire de création répond « Ce Code est déjà pris » sans aucun rate-limiting — il permet d'énumérer des Codes valides et de contourner l'anti-brute-force de la récupération, donc de lire des conversations d'autres élèves.
2. **FR-14 non satisfait** : le texte informant l'élève de la « limite » de confidentialité (Signal de danger ⇒ alerte) a été supprimé en Story 1.5 sans révision du PRD, qui l'exige toujours — transparence envers des mineurs, point sensible.
3. **Marquage `is_priority` fire-and-forget** : un Signal de danger détecté peut être silencieusement perdu (pas de retry), alors que SM-2 exige « 100 % des messages détectés déclenchent une alerte, sans exception ».

Aucun finding **Critique**. Le reste est du durcissement (en-têtes HTTP, purge/rétention, mode éphémère à clarifier) et de la dette maîtrisable (duplications, types Supabase non générés, absence totale de tests automatisés).

### Scorecard

| Domaine | Note | Justification |
|---|---|---|
| A. Architecture & cohérence | **4/5** | Architecture réellement respectée, compromis tracés ; perd un point sur la rétro-propagation spéc↔code incomplète (FR-14, FR-19/AD-5, epics.md) et le fire-and-forget du chemin critique. |
| B. Qualité & DRY | **3,5/5** | Cœur métier propre, strict, bien commenté ; pénalisé par la duplication des contrôles d'autorisation et des contraintes de validation, et l'absence de types Supabase générés. |
| C. Sécurité | **3,5/5** | Fondations solides (RLS, allowlist, cookies, secrets) ; le maillon faible est le Code de récupération : énumérable sans limite, entropie libre, trace d'audit réversible. |
| D. État & flux de données | **4/5** | Aucun état module-level mutable, appartenance vérifiée à chaque frontière, erreurs Supabase systématiquement gérées ; écart entre la promesse « éphémère » et la réalité (persistance + accès URL à vie). |
| E. Dépendances & config | **4/5** | Versions patchées (Next 16.2.10 post-release sécurité mai 2026), zéro secret dans l'historique, tsconfig strict ; manquent les en-têtes de sécurité et un script test/typecheck. |
| F. Tests | **2/5** | Zéro test automatisé (choix documenté : vérification manuelle par story), aucun filet de régression sur les chemins critiques. |

---

## 2. Top risques et plan de remédiation ordonné

### [Élevé] R1 — Oracle d'énumération des Codes de récupération, sans rate-limiting
`app/discussion-anonyme/actions.ts:70-73` + `lib/session.ts` (`isCodeAvailable`)
`choisirModeSauvegarder` répond « Ce Code est déjà pris. Choisis-en un autre. » quand le Code existe, **sans aucun anti-brute-force** (aucun appel à `isRecoveryLocked`, contrairement à `recupererConversationParCode`). Or le Code est à la fois l'identifiant et le secret de lecture d'une conversation. Un attaquant énumère des Codes valides via la création (illimitée), puis les rejoue sur la récupération pour lire la conversation d'un autre élève. Le verrou 5 échecs/15 min (AD-9) est ainsi contourné. Aggravé par **R1-bis** : aucune exigence d'entropie sur le Code (`CODE_REGEX = /^[a-zA-Z0-9]{6,20}$/`, `actions.ts:42`, lowercased ligne 51) — `azerty` ou `123456` sont acceptés, l'espace réellement exploité est celui des Codes faibles humains. Documenté en Story 1.2 comme « oracle accepté », mais la décision n'avait pas relié l'oracle au contournement du rate-limiting de la récupération.
**Remédiation :** appliquer le même verrou par IP (`isRecoveryLocked` ou compteur dédié) sur `choisirModeSauvegarder`, et durcir la politique de Code (longueur minimale supérieure + liste noire de Codes triviaux, ou génération côté serveur).

### [Élevé] R2 — FR-14 non satisfait : la « limite » de confidentialité n'est plus divulguée, PRD jamais révisé
`app/discussion-anonyme/page.tsx:124-129` vs `prd.md:115` (FR-14) et `prd.md:44` (UJ-1)
Le texte affiché dit seulement « Tu peux écrire ici sans donner ton nom… une vraie personne va lire ». Le paragraphe « Une seule limite : si ce que tu écris fait penser à un danger sérieux… » (livré en Story 1.1) a été supprimé au commit `9b5e3c7` (Story 1.5, hors File List), pour un motif documenté (risque d'auto-censure, rétro Epic 1). **Mais le PRD n'a pas suivi** : FR-14, UJ-1 et NFR-8 exigent toujours cette divulgation — contrairement à FR-8/FR-10 qui avaient été formellement révisés (commit `a410797`). Une exigence de transparence envers des mineurs (Children's Code cité au PRD §10) est non implémentée sans décision formelle, et la Story 1.1 « done » n'a plus ses AC satisfaites.
**Remédiation :** décision explicite de Charles → soit réviser FR-14/UJ-1/NFR-8 dans le PRD, soit restaurer une phrase de limite reformulée.

### [Élevé] R3 — Signal de danger : marquage `is_priority` en fire-and-forget, perte silencieuse possible
`app/discussion-anonyme/actions.ts:198-217`
L'update `is_priority = true` est différé via `after()` ; en cas d'échec (erreur Supabase, interruption de la fonction serverless), il n'y a **ni retry ni trace** autre qu'un `console.error` (lignes 210-214). La détection n'est persistée nulle part ailleurs. SM-2 exige « 100 % des messages détectés déclenchent une alerte, sans exception » et FR-9 « systématiquement ». C'est le message qui tolère le moins la perte. (Probabilité faible, impact maximal — d'où le classement Élevé.)
**Remédiation :** rendre l'update synchrone (un round-trip Supabase reste très en dessous du budget 2 s de FR-3) ou ajouter un retry ; à revoir impérativement quand l'alerte Telegram (Epic 3) se branchera sur ce chemin.

### Plan ordonné (après R1–R3)

4. **En-têtes de sécurité HTTP** (Moyen, voir C-4) — en particulier `Referrer-Policy: no-referrer` : les URLs contiennent `?conv=<uuid>` et le parcours éphémère repose sur le secret de cette URL.
5. **Clarifier le mode éphémère** (Moyen, D-1/A-2) — expiration d'accès ou avertissement complété + révision FR-19/AD-5.
6. **Trace d'audit `recovery_attempts`** (Moyen, C-3) — remplacer le sha256 non salé par un HMAC (ou ne plus stocker le hash) + purge périodique.
7. **Politique de rétention** (Moyen, D-2) — trancher avant lancement (données sensibles de mineurs, accumulation sans borne).
8. **Factorisations à risque** (Moyen, B-1/B-3) — bloc d'autorisation partagé, constantes de validation partagées, types Supabase générés.
9. **Filet de tests minimal** (Moyen, F) — unitaires sur `lib/danger-keywords.ts` et la logique pure de `lib/session.ts`.

---

## 3. Détail par domaine

### A. Architecture & cohérence spéc↔code — 4/5

- **[Élevé]** FR-14 non satisfait — voir **R2** ci-dessus.
- **[Moyen]** Marquage `is_priority` fire-and-forget — voir **R3** ci-dessus (reclassé Élevé en synthèse).
- **[Moyen]** Mode éphémère lisible/inscriptible à vie via l'URL, contredit FR-19 et AD-5 — `app/discussion-anonyme/actions.ts:118` (redirect `?etape=pret&conv=<uuid>`), `page.tsx:84-100` et `actions.ts:160` (aucune vérification quand `is_ephemeral`). AD-5 affirme « l'élève n'a aucun moyen d'y revenir », FR-19 « il ne pourra pas revenir lire une réponse » — or l'URL reste dans l'**historique du navigateur** (postes partagés de lycée = le scénario que ce mode devait protéger) et permet de relire tout le fil et d'écrire à la place de l'élève, indéfiniment. L'avertissement UI (`page.tsx:167-171`) mentionne partage de lien et favoris mais ni l'historique ni la *lecture*. Acté en revues 1.3/1.4, jamais reporté dans PRD/spine. → Servir le fil sans `conv` dans l'URL, ou expirer l'accès, ou réviser FR-19/AD-5 + compléter l'avertissement.
- **[Faible]** `epics.md:37` décrit encore l'ancien FR-10 (affichage des numéros à l'élève) dans l'inventaire des exigences, alors que Coverage Map, PRD et code implémentent l'alerte silencieuse — un futur agent compilant le contexte depuis cette ligne peut réimplémenter le comportement annulé. → Réviser la ligne 37.
- **[Faible]** AD-9 non conforme sur deux points non reportés dans le spine — `lib/session.ts:44-51` : sha256 non salé au lieu du bcrypt annoncé pour `code_hash_attempted` (voir C-3) ; `lib/session.ts:164-208` : fenêtre glissante au lieu de « 5 échecs consécutifs » (plus strict, documenté). → Mettre AD-9 à jour ou changer l'implémentation.
- **[Faible]** Contradiction interne du spine : « une page n'appelle jamais directement lib/supabase-server.ts » vs `app/discussion-anonyme/page.tsx:13,69,103` qui lit directement `conversations`/`messages`. La Story 1.4 a interprété AD-3 comme « écritures seulement » (raisonnable) mais la phrase absolue du paradigme reste fausse. → Amender en « toute **écriture** passe par une Server Action ».
- **[Faible]** `seConnecter` ne vérifie pas l'allowlist `ORGANISATEUR_EMAILS` — `app/organisateurs/actions.ts:20-44` : un compte Supabase valide hors allowlist obtient un cookie de session puis boucle connexion→`/organisateurs`→connexion. Aucune donnée accessible (`requireOrganisateur` + RLS tiennent), mais défense en profondeur incohérente. → Vérifier l'allowlist dans `seConnecter` et `signOut()` avant l'erreur générique.
- **[Faible]** `supabase/config.toml:176,221` : `enable_signup = true` (défaut du template) alors que l'inscription publique a été désactivée à la main dans le dashboard prod (Story 3.1, AD-8). Un `supabase config push` réappliquerait le défaut. Confiance moyenne (dépend de l'usage de la CLI). → Passer les deux flags à `false`.
- **[Faible]** FR-17 partiel : l'avertissement « ne choisis pas un Code facile à deviner (prénom, date de naissance) » exigé par le PRD manque — `app/discussion-anonyme/mode-choice.tsx:29-32` ne couvre que le partage. Pertinent car AD-9 part du principe que ces Codes sont prévisibles (cf. R1-bis). → Une phrase de plus.
- **[Info]** `proxy.ts` est bien le middleware Next 16, correctement branché (`proxy.ts:22,73-75`, matcher `/organisateurs/:path*`, pas de `middleware.ts` concurrent) ; rôle limité au contrôle optimiste, contrôle authoritatif dans `requireOrganisateur()` — conforme AD-3.
- **[Info]** Patterns Server Actions cohérents à une variante près : `choisirModeEphemere` (`actions.ts:102-119`) remonte l'erreur en query param `?erreur=ephemere` au lieu du state `useActionState` ; et `choisirModeSauvegarder`/`recupererConversationParCode` n'ont pas le try/catch global d'`envoyerMessage`. → Uniformiser à l'occasion.
- **[Info]** Dérive documentaire post-3.1 : `SUPABASE_PUBLISHABLE_KEY`, `ORGANISATEUR_EMAILS` (`.env.local.example:17,25`, `lib/supabase-auth.ts:9-25`) et `@supabase/ssr` absents des tables « Config & secrets »/Stack du spine « verrouillé » (AD-2).
- **[Info]** Hors-scope tracés, pas des écarts : homepage boilerplate (FR-12, Story 4.1 backlog + Story 4.0 en cours), `lib/telegram.ts`/`app/organisateurs/[conversationId]/`/Epic 4 absents (backlog), `flagged_missed_danger` sans UI (Epic 3), coordonnées CPE « À COMPLÉTER PAR CHARLES » dans `docs/procedure-escalade-cpe-counsellor.md` (prérequis de lancement documenté).

### B. Qualité & DRY — 3,5/5

- **[Moyen]** Bloc d'autorisation conversation dupliqué entre action et page — `app/discussion-anonyme/actions.ts:145-172` et `page.tsx:69-100` : même `select("id, is_ephemeral, session_token_hash")` + lecture cookie + calcul `autorise` avec `verifySecret`. Un changement de règle d'accès (ex. expiration) devra être fait deux fois, sur un contrôle de sécurité. → Extraire `getAuthorizedConversation(conversationId)` dans `lib/session.ts` (AD-3 reste respecté : c'est la logique qui est partagée, chaque frontière l'appelle).
- **[Moyen]** Quasi-duplication `findConversationBySessionToken`/`findConversationByRecoveryCode` — `lib/session.ts:91-124` et `132-162` : structurellement identiques (~35 lignes, y compris la gestion subtile « ligne corrompue → continue »), seules la colonne et le filtre `is_ephemeral` changent. → Helper privé `findConversationByHashedSecret(column, secret, filters?)`.
- **[Moyen]** Contraintes de validation dupliquées serveur/client — `actions.ts:34,42` (`MESSAGE_MAX_LENGTH`, `CODE_REGEX`) vs `message-form.tsx:39`, `mode-choice.tsx:45-48`, `recovery-form.tsx:41-44` (le pattern `[a-zA-Z0-9]{6,20}` existe en 5 exemplaires). Changer la limite à un seul endroit crée une divergence silencieuse. → Module partagé `lib/validation.ts`.
- **[Moyen]** Clients Supabase non typés — `lib/supabase-server.ts:9`, `lib/supabase-auth.ts:41,79` : pas de générique `Database`, donc les lignes retournées sont `any` en pratique ; `page.tsx:62-66` et `conversation-thread.tsx:1-6` redéclarent des types « miroir » du schéma qui peuvent dériver des migrations sans erreur de compilation. → `supabase gen types typescript` + typer les trois clients.
- **[Faible]** Homepage = boilerplate create-next-app — `app/page.tsx:1-65` + 5 SVG du template non référencés ailleurs. Déclassé (initialement Élevé) car **tracé** : FR-12/Story 4.1 en backlog, Story 4.0 design en cours au moment de l'audit.
- **[Faible]** Message « erreur pendant la création » copié 3× — `actions.ts:65-67`, `actions.ts:91-93`, `page.tsx:143-146` — alors que les autres messages sont des constantes. → `ERREUR_GENERIQUE_CREATION`.
- **[Faible]** Classes Tailwind dupliquées dans 5 composants (input ~110 caractères identiques : `mode-choice.tsx:50`, `recovery-form.tsx:46`, `connexion-form.tsx:32,49`, `message-form.tsx:41` ; `<p role="alert">` en 5 exemplaires). → 3-4 petits composants UI (`Input`, `FieldError`, `SubmitButton`) — la Story 4.0 shadcn en cours va probablement adresser ce point.
- **[Faible]** Exports jamais importés ailleurs : `lib/session.ts:13` (`generateSessionToken`), `lib/danger-keywords.ts:7` (`DANGER_KEYWORDS`), `lib/accuse-reception.ts:4` (`ACCUSES_RECEPTION`) — vérifié par grep global. → Retirer `export` (ou garder les listes si des tests arrivent).
- **[Faible]** `lib/supabase-server.ts:1-11` : seul fichier en guillemets simples/sans point-virgule/commentaires anglais (tout le reste : doubles + point-virgule + français), et pas de Prettier pour trancher. → Aligner + ajouter Prettier.
- **[Faible]** `package.json:2` : `"name": "la-parole-contre-tous"` — littéralement l'inverse du nom du projet. → Renommer.
- **[Info]** Nommage bilingue non systématique (`hashSecret(valeur)` `lib/session.ts:17`, `normaliserAccents` vs `containsDangerSignal` `lib/danger-keywords.ts:27,31`). La règle implicite « API métier en français, plomberie en anglais » n'est pas tenue partout. → La documenter dans le contexte projet.
- **Vérifié sans finding :** aucun `any` explicite ni assertion `as`, `tsc --noEmit` et `eslint .` sans erreur, pas d'imports inutilisés, aucune fonction > ~100 lignes, imbrication ≤ 3, la complexité O(n) bcrypt est intentionnelle et commentée.

### C. Sécurité — 3,5/5

- **[Élevé]** Oracle d'énumération des Codes via la création, sans rate-limiting — voir **R1**.
- **[Moyen]** Aucune exigence d'entropie sur le Code (`actions.ts:42,51`) — voir **R1-bis**.
- **[Moyen]** Trace d'audit réversible + IP stockée sans borne — `lib/session.ts:49-51` (`hashForAudit` = sha256 **non salé** d'un Code à faible entropie ⇒ inversible par dictionnaire) + `supabase/migrations/20260709000000_recovery_attempts.sql` (IP en clair, aucune purge). Une fuite de `recovery_attempts` relie IP → Code → conversation : désanonymisation partielle. NFR-7 respecté à la lettre (« jamais en clair ») mais pas dans l'esprit. → HMAC avec clé serveur ou ne plus stocker le hash (IP + succès/échec suffisent au verrou) + purge > 15-30 min. (Recoupe A : AD-9 annonçait bcrypt.)
- **[Moyen]** Rate-limiting fondé sur `x-forwarded-for` — `actions.ts:244-246` (`split(",")[0]` = valeur contrôlable par le client hors plateforme de confiance). Fiable sur Vercel (réécrit par la plateforme, documenté Story 1.5) ; **falsifiable en self-host/autre proxy** → verrou neutralisable, aggrave R1. → Documenter « Vercel uniquement » comme contrainte de sécurité dans le code. (Recoupe D.)
- **[Moyen]** Aucun en-tête de sécurité HTTP — `next.config.ts:3-5` vide : pas de CSP, X-Frame-Options/frame-ancestors, X-Content-Type-Options, HSTS, Permissions-Policy, ni surtout `Referrer-Policy` alors que les URLs portent `?conv=<uuid>` (secret du parcours éphémère) qui peut fuir via `Referer` vers toute origine tierce liée. → `async headers()` avec au minimum `Referrer-Policy: no-referrer` + CSP, et `poweredByHeader: false`. (Recoupe E ; sévérité consolidée Moyen.)
- **[Faible]** Cookies de session Supabase Auth organisateurs non `httpOnly` (défaut `@supabase/ssr`, vérifié dans le package) — le cookie élève maison est, lui, correctement durci (`lib/session.ts:238-248` : httpOnly, secure en prod, sameSite lax). Pas de vecteur XSS actuel (aucun `dangerouslySetInnerHTML`, rendu échappé), mais la Story 3.2 affichera des messages d'élèves côté organisateur : à surveiller. → Accepter (tradeoff standard) + CSP.
- **[Faible]** `lib/supabase-server.ts` (clé service_role) sans garde mécanique — protégé par convention (commentaire ligne 7) et aucun import client aujourd'hui (vérifié), mais rien n'empêche un futur import client de faire fuiter la clé dans le bundle. → `import "server-only";` en tête (idem `supabase-auth.ts`).
- **[Info]** Timing side-channel sur la récupération — `lib/session.ts:132-162` : retour au premier match du scan bcrypt O(n) ; marginal à l'échelle d'un lycée et derrière le rate-limiting.
- **[Info]** Conversations éphémères accessibles par simple possession de l'UUID (`page.tsx:88-100`, `actions.ts:160-172`) — documenté (AC #6), traité en D-1/A-2.
- **Points positifs vérifiés :** RLS activé deny-by-default sur les 3 tables sans policy `anon`/`authenticated` (si la clé publishable fuit, les tables restent inaccessibles) ; aucun `NEXT_PUBLIC_`, aucun secret en dur ni dans l'historique git ; double barrière AuthZ organisateurs (proxy optimiste + `requireOrganisateur()` avec `getUser()` + allowlist, `lib/supabase-auth.ts:118-133`) ; message de connexion générique anti-énumération (`app/organisateurs/actions.ts:13`) ; aucune route API custom (CSRF couvert par la protection intégrée des Server Actions) ; détection de danger jamais renvoyée à l'élève.

### D. État & flux de données — 4/5

- **[Moyen]** Mode éphémère : accès permanent par URL + historique navigateur — voir A-2/plan n°5 (finding convergent A/C/D, consolidé).
- **[Moyen]** Aucune purge : conversations « éphémères » et `recovery_attempts` persistent sans borne — `supabase/migrations/20260708000000:7-18`, `20260709000000:6-12`. Le mode éphémère persiste les messages comme le mode sauvegardé (seuls les hash sont `null`) alors que l'UI dit « Rien n'est sauvegardé » (`page.tsx:161`) ; `recovery_attempts` croît indéfiniment alors que seule la fenêtre de 15 min est lue (`lib/session.ts:193-198`). Rétention explicitement différée (`epics.md:96`) mais la dette grandit chaque jour. → Trancher avant lancement ; au minimum purge périodique.
- **[Faible]** Expiration incohérente cookie (~12 mois, posé à la création seulement) vs base (jamais) — `lib/session.ts:7,238-249` : pas de rafraîchissement au retour (`page.tsx:42-53`) → perte silencieuse du retour automatique 12 mois après la *création* ; et un `session_token` exfiltré reste valide à vie. → Re-poser le cookie à chaque retour réussi (une ligne).
- **[Faible]** Double-submit possible sur « Continuer en éphémère » — `page.tsx:153-178` : `<form action>` serveur sans état pending, contrairement aux 3 autres formulaires (`mode-choice.tsx:62`, `message-form.tsx:53`) → double-clic = conversation orpheline. → Client Component avec `useFormStatus`.
- **[Faible]** `x-forwarded-for` falsifiable hors Vercel — consolidé avec C-4.
- **[Info]** `seConnecter` pose une session avant vérification allowlist — consolidé avec A-7.
- **[Info]** Pas de `revalidatePath` après envoi (`actions.ts:219`) : le message n'apparaît qu'au rechargement — **écarté explicitement en revue Story 1.4** (non-objectif documenté) ; point de vigilance pour l'Epic 3 (réponses organisateur).
- **[Info]** Scan bcrypt O(n) déclenché sur simple GET avec cookie invalide (`lib/session.ts:91-124`, `page.tsx:46-53`) — nuance nouvelle du compromis O(n) documenté : vecteur d'épuisement CPU non authentifié, marginal à cette échelle.
- **Vérifié sans finding :** aucun état module-level mutable (singleton `supabaseServer` sans état utilisateur, `persistSession: false` ; `organisateurEmails` immuable ; client Auth recréé par requête `supabase-auth.ts:38`) — aucune fuite inter-requêtes possible ; appartenance conversation↔session revérifiée à chaque lecture ET écriture en mode sauvegardé ; `redirect()` jamais dans un try/catch (les 6 actions + page vérifiées) ; erreurs Supabase toujours testées (`maybeSingle()`, `data ?? []`) ; cohérence TS↔SQL exacte sur les colonnes utilisées ; pages correctement dynamiques ; les compromis déjà actés (TOCTOU unicité, TOCTOU verrou, invalidation multi-appareils) ne sont pas re-signalés.

### E. Dépendances & configuration — 4/5

- **[Moyen]** `.gitignore:18` : `.env*` en fin de fichier **annule la négation** `!.env.local.example` (dernier motif prévalant, vérifié via `git check-ignore`) — le fichier d'exemple ne reste versionné que parce qu'il est déjà dans l'index ; tout futur `.env.example` serait silencieusement ignoré. Doublon des lignes 3-4. → Supprimer la ligne 18.
- **[Moyen]** Aucun script `test` ni `typecheck` — `package.json:5-10` (voir domaine F). → `"typecheck": "tsc --noEmit"` + Vitest ciblant `lib/`.
- **[Moyen]** En-têtes de sécurité absents — consolidé avec C-4.
- **[Faible]** Patches en retard : `@supabase/ssr` 0.12.0 → 0.12.3, `supabase-js` légèrement en retrait. Aucune CVE connue (confiance moyenne : absence d'advisory trouvée).
- **[Info]** Versions principales saines (confiance haute, sources vérifiées) : Next 16.2.10 = LTS postérieure à la release sécurité de mai 2026 (13 CVE corrigées en 16.2.6, dont CVE-2026-23870) ; React 19.2.4 non concerné par les CVE RSC (elles visaient `react-server-dom-*`, vendoré et patché avec Next) ; bcryptjs 3.0.3 et TypeScript 6.0.3 à jour.
- **[Info]** Aucun secret commité, ni maintenant ni dans l'historique — `git log --all` sur `*.env*` : seul `.env.local.example` (sans valeurs) ; grep de l'historique (`sb_secret_`, JWT `eyJ`) : rien ; la clé citée dans la story 3.1 est explicitement factice.
- **[Info]** CLI `supabase` en devDependency : justifié (workflow migrations local, version partagée épinglée).
- **[Info]** Reste de la config propre : `tsconfig.json:7` `strict: true`, eslint flat config Next standard, `supabase/config.toml` sans secret (les `enable_signup = true`/`minimum_password_length = 6` lignes 176/182 ne concernent que l'instance **locale** — mais voir A-8 pour le footgun `config push`).
- **[Retiré]** « package.json désynchronisé de package-lock.json » : artefact de la Story 4.0 non commitée apparue en cours d'audit ; l'état actuel des deux fichiers est cohérent. À re-vérifier au commit de la Story 4.0 (et vérifier alors que `class-variance-authority`, `lucide-react`, `radix-ui`, `shadcn` déclarés sont réellement utilisés).

### F. Tests — 2/5

- **[Moyen]** Zéro test automatisé : aucun fichier `*.test.*`/`*.spec.*`, aucune dépendance de test, aucun script `test` (`package.json:5-10`). C'est un **choix documenté** (stories : « aucun framework de test dans la Stack — vérification manuelle uniquement ») et les vérifications manuelles consignées sont sérieuses (vraies requêtes HTTP contre `next dev`, lecture directe des tables — cf. Story 1.5). **Mais** les chemins critiques — `containsDangerSignal` (`lib/danger-keywords.ts`), verrou anti-brute-force (`lib/session.ts:164-208`), vérification d'appartenance (`actions.ts:145-172`) — n'ont aucun filet de régression : chaque story future peut casser silencieusement une vérification manuelle qui ne sera pas rejouée. La détection de danger est le cas idéal du test unitaire (fonction pure, table de cas). → Vitest sur `lib/` d'abord (danger-keywords, logique pure de session), e2e Playwright plus tard si le produit grossit.

---

## 4. Annexe — Quick wins (fort ROI, effort minime)

| # | Correction | Fichier | Effort |
|---|---|---|---|
| 1 | `import "server-only";` en tête des libs à clé service | `lib/supabase-server.ts`, `lib/supabase-auth.ts` | 2 lignes |
| 2 | Supprimer la ligne 18 (`.env*`) qui annule la négation | `.gitignore:18` | 1 ligne |
| 3 | `Referrer-Policy: no-referrer` + `X-Content-Type-Options` + `frame-ancestors` via `headers()` | `next.config.ts` | ~20 lignes |
| 4 | Rendre l'update `is_priority` synchrone (retirer `after()`) | `app/discussion-anonyme/actions.ts:198-217` | ~5 lignes |
| 5 | Vérifier l'allowlist dans `seConnecter` + `signOut()` sinon | `app/organisateurs/actions.ts:33-43` | ~8 lignes |
| 6 | Re-poser le cookie de session au retour réussi (sliding expiration) | `app/discussion-anonyme/page.tsx:50` | 1 ligne |
| 7 | Constante `ERREUR_GENERIQUE_CREATION` (3 copies du texte) | `actions.ts:65,91`, `page.tsx:143` | 5 min |
| 8 | Phrase « pas de Code facile à deviner » (FR-17) | `app/discussion-anonyme/mode-choice.tsx:29-32` | 1 phrase |
| 9 | Corriger la ligne FR-10 obsolète de l'inventaire | `_bmad-output/planning-artifacts/epics.md:37` | 1 ligne |
| 10 | `enable_signup = false` (2 occurrences) | `supabase/config.toml:176,221` | 2 lignes |
| 11 | Renommer le package `la-parole-avant-tout` | `package.json:2` | 1 ligne |
| 12 | Script `"typecheck": "tsc --noEmit"` | `package.json` | 1 ligne |
| 13 | `useFormStatus`/`disabled` sur le formulaire éphémère (double-submit) | `app/discussion-anonyme/page.tsx:153-178` | ~15 lignes |
| 14 | Bump `@supabase/ssr` 0.12.0 → 0.12.3 | `package.json` | 1 commande |

---

## 5. Ce qui n'a PAS pu être vérifié (et pourquoi)

- **Configuration Supabase de production** (dashboard) : inscription publique réellement désactivée, exactement 2 comptes organisateur, RLS effectivement appliquée à la base réelle, politique de mots de passe, type de clés JWT (dont dépend le commentaire sur `getClaims()` dans `proxy.ts`), MFA — hors du repo, inaccessible en lecture de code.
- **Déploiement Vercel** : variables d'environnement présentes, proxy actif en prod, comportement réel de `x-forwarded-for` — pas d'accès à la plateforme.
- **Contenu de `.env.local`** : volontairement non lu (risque d'exposer des secrets dans le rapport) ; impossible de confirmer que `ORGANISATEUR_EMAILS` est bien renseigné.
- **Comportements à l'exécution** : accusé < 2 s (NFR), rendu mobile/desktop, redirections proxy réelles, `after()` sous timeout serverless — contrainte lecture seule, aucune exécution (ni `npm run build`, qui écrit dans `.next/`).
- **`npm audit`** : non lancé (risque d'écriture sur le lockfile) ; l'analyse CVE repose sur la lecture des versions + recherches web (confiance moyenne pour supabase-js/ssr/bcryptjs, haute pour Next/React).
- **Synchronisation de l'historique de migrations avec la base réelle** (réconciliée en Story 1.5 d'après la rétro) — vérifiable uniquement contre la base distante.
- **Story 4.0 « fondation design shadcn »** : non commitée, apparue dans le working tree **pendant** l'audit — explicitement exclue du périmètre ; à auditer à son commit.
