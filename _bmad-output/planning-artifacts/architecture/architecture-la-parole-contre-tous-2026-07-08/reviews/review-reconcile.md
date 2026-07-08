---
title: "Review — fidélité du spine architecture aux inputs (PRD, addendum, memlog)"
date: 2026-07-08
scope: ARCHITECTURE-SPINE.md vs prd.md / addendum.md / .memlog.md
---

# Verdict global

Le spine est globalement fidèle aux décisions actées dans le memlog (Wix abandonné, stack Next.js/Supabase/Vercel, Telegram, mécanisme maison session+code, mots-clés en config) — ces choix ne sont pas remis en cause ici. En revanche, l'exercice de compression en AD/tableaux a fait tomber plusieurs éléments plus fins qui existaient soit dans le PRD (une contrainte numérique, une hypothèse jamais tranchée) soit dans le memlog lui-même (un détail de mécanisme décidé mais simplifié en route). Le plus concret : **le modèle de données n'a aucun champ pour représenter "lu/ouvert par un organisateur"**, alors que deux fonctionnalités bindées au spine (FR-5, FR-15) reposent explicitement dessus, et que l'arborescence du spine elle-même nomme une action "marquer lu" qui n'a nulle part où écrire son résultat.

---

## Finding 1 — [HIGH] Aucun champ "lu/ouvert" dans le modèle de données, alors que FR-5 et FR-15 en dépendent structurellement

**Où :** ARCHITECTURE-SPINE.md, ERD lignes 139–165 (`CONVERSATION`, `MESSAGE`), Structural Seed ligne 133 (`cron -->|"vérifie messages prioritaires non lus"| db`), arborescence ligne 180 (`actions.ts # Server Actions : répondre, marquer lu`).

Le PRD exige deux choses qui reposent sur un état "lu" :
- **FR-5** (prd.md l.185-191) : "un indicateur clair des messages non lus/non traités" — "La liste distingue visuellement les Conversations avec un message non traité de celles déjà répondues."
- **FR-15** (prd.md l.248-255) : la relance à 4h se déclenche "si aucun des deux Organisateurs n'a ouvert la Conversation signalée prioritaire" — c'est littéralement la condition de déclenchement du cron.

Le spine nomme cette notion ("marquer lu" dans l'arborescence, "messages prioritaires non lus" dans le diagramme Structural Seed) mais **aucune des deux entités `CONVERSATION` ou `MESSAGE` de l'ERD ne porte de champ pour la stocker** (pas de `read_at`, `opened_by_organizer_at`, ni équivalent). L'ERD contient pourtant des champs bien plus secondaires (`flagged_missed_danger`, `is_ephemeral`) — ce n'est donc pas une omission volontaire de type "noms et relations seulement", mais un trou concret : tel quel, le cron FR-15 n'a rien à interroger pour savoir si une conversation a été ouverte, et FR-5 n'a rien à afficher comme indicateur non-lu.

**Impact :** c'est un bloqueur d'implémentation silencieux sur deux FR bindées au spine (dont une FR de sécurité — la relance de secours en cas de Signal de danger non traité).

---

## Finding 2 — [HIGH] AD-9 simplifie le verrouillage anti-brute-force décidé dans le memlog (IP seule vs IP+code visé), et l'ERD verrouille cette simplification

**Où :** ARCHITECTURE-SPINE.md AD-9, l.89-93 ; ERD `RECOVERY_ATTEMPT`, l.159-164.

Le memlog (l.20) documente la décision ainsi : *"compteur d'échecs + horodatage par tentative **sur l'IP+code visé** ; verrouillage temporaire (ex. 15 min) après 5 échecs consécutifs."* — c'est-à-dire un compteur par combinaison (IP, code tenté), ce qui limite le nombre d'essais contre un code cible précis sans bloquer un élève légitime qui se trompe de code une fois puis retape le bon.

Le spine (AD-9) simplifie en cours de route vers un blocage **par IP seule** : *"chaque tentative... est comptée (par IP)... Après 5 échecs consécutifs..., la vérification de Code est bloquée pour cette IP."* Aucune mention du "code visé". Cohérent avec cette dérive, l'entité `RECOVERY_ATTEMPT` de l'ERD n'a **aucun champ pour le code tenté** (seulement `id`, `ip`, `success`, `created_at`), donc même si on voulait revenir à la granularité décidée, le schéma actuel ne le permettrait pas.

Ce n'est pas nécessairement une mauvaise décision technique (IP-only est plus simple, cohérent avec l'esprit "équipe débutante"), mais c'est un changement de mécanisme par rapport à ce qui a été acté avec Charles dans le memlog, non signalé comme tel dans le spine (pas de note "simplifié depuis la décision initiale").

---

## Finding 3 — [MEDIUM] La pause automatique Supabase après 7 jours d'inactivité (constraint actée en memlog) disparaît du spine, alors que le PRD pose la disponibilité continue comme NFR explicite

**Où :** memlog l.13 (constraint) vs ARCHITECTURE-SPINE.md (absent partout, y compris §Deferred l.213-220).

Le memlog note explicitement : *"projet mis en pause après 7 jours d'inactivité totale (se réactive automatiquement à la prochaine requête, léger délai)."* Le PRD §11 (prd.md l.391) pose comme NFR transverse : *"Disponibilité : le chat doit rester accessible en continu (l'urgence ne suit pas les heures de cours)."* Une pause de projet Supabase — même auto-réveil avec délai — est exactement le genre de risque à consigner comme accepté (le spine le fait déjà pour un risque analogue : "Canal de secours si Telegram tombe en panne — non couvert ; risque accepté à cette échelle", Deferred l.217). Ici, rien : ni dans Deferred, ni dans le Stack, ni ailleurs. Risque mineur en pratique (trafic régulier attendu) mais silencieusement tombé alors qu'il avait été identifié et vérifié pendant la session.

---

## Finding 4 — [MEDIUM] L'hypothèse PRD sur l'accusé de réception assisté par IA (FR-3) n'a été ni tranchée ni reportée

**Où :** prd.md l.171 (FR-3, `[ASSUMPTION]`) et l.363 (§9) vs ARCHITECTURE-SPINE.md, Capability Map ligne 196 (FR-3 → `app/discussion-anonyme/actions.ts`, AD-3 seulement).

Le PRD marque explicitement : *"Le texte est généré ou assisté par IA `[ASSUMPTION]` mais reste cohérent et non générique-robotique — à valider avec un premier jet concret lors de l'architecture/UX."* C'est une invitation explicite à ce que la phase d'architecture tranche ce point. Le memlog ne contient aucune trace d'une discussion sur ce sujet, et le spine ne la mentionne pas non plus — ni comme décision ("texte statique, pas d'IA"), ni comme entrée Deferred. Silence total.

C'est plus qu'un détail de copy : si le texte finit par nécessiter un vrai appel à un fournisseur d'IA externe, cela introduit une dépendance serveur/vendor non couverte par AD-2 ("Stack cœur verrouillée... rien d'autre côté serveur/hébergement sans repasser par ce spine") et non listée dans le tableau Stack (l.112-123). Vu l'esprit du produit ("simplicité pour une équipe débutante"), il est probable que la réponse voulue soit "texte statique, pas d'IA" — mais le spine ne le dit pas, donc rien n'empêche cette dérive plus tard.

---

## Finding 5 — [LOW] Le signalement rétroactif "aurait dû déclencher FR-9" (SM-2bis) a un champ en base mais aucune Server Action documentée

**Où :** ARCHITECTURE-SPINE.md ERD l.149 (`flagged_missed_danger`) vs Capability Map (aucune ligne dédiée) et arborescence (aucune action listée).

FR-9 (prd.md l.232) exige qu'*"un Organisateur peut marquer rétroactivement une Conversation comme 'aurait dû déclencher FR-9 mais ne l'a pas fait'"*. Le champ `flagged_missed_danger` existe dans l'ERD (preuve que l'intention a été retenue), mais aucune Server Action ni ligne de Capability Map ne documente où/comment un organisateur pose ce flag (le seul `actions.ts` organisateur mentionné dans l'arborescence liste "répondre, marquer lu" — pas ce signalement). Écart mineur mais cohérent avec le pattern des Findings 1 et 2 : des capacités actées dans les FR "s'arrêtent" au niveau du champ de données sans traverser jusqu'à la couche Server Action/UI dans le spine.

---

## Finding 6 — [LOW] Les bornes de longueur du Code (FR-17, 6–20 caractères, `[ASSUMPTION]` à valider en architecture/UX) ne sont jamais reprises

**Où :** prd.md l.139 (FR-17) vs ARCHITECTURE-SPINE.md AD-5 (l.65-69, aucune borne mentionnée), memlog (aucune trace de la question).

Le PRD indexe explicitement cette hypothèse comme "à valider en architecture/UX" (§9, l.369). Ni le memlog ni le spine ne la retranchent, ne la confirment, ni ne la reportent formellement en Deferred. Impact limité (c'est une contrainte de validation de formulaire, facilement ajoutable plus tard), mais c'est un point explicitement fléché pour cette phase et absent du résultat.

---

## Points vérifiés et jugés fidèles (pas de problème trouvé)

- **FR-15 (relance 4h)** : comportement (4h, deux organisateurs, même canal Telegram réutilisé plutôt qu'un canal de secours séparé) fidèle à la décision memlog l.14 et à AD-7 (l.77-82) — seul le support de données manque (Finding 1), pas le comportement décrit.
- **FR-9/FR-10 (détection jamais dépendante d'une lecture humaine, notification double)** : AD-6 exécute la détection côté serveur avant écriture en base et avant l'accusé de réception, sans validation humaine ; AD-7 envoie l'alerte aux deux `chat_id` simultanément sur Signal de danger. Fidèle.
- **FR-18 (message d'erreur générique)** : repris mot pour mot dans les Consistency Conventions (l.108) — "qu'un Code proche existe ou non". Fidèle (voir cependant Finding 2 sur le mécanisme de comptage sous-jacent).
- **Cookie ~12 mois (§9 PRD)** : AD-5 (l.69) cite explicitement "cf. hypothèse PRD §9" et garde le tilde d'approximation — ne surclasse pas l'hypothèse en fait acquis. Pas de problème.
- **Non-Goals (§5 PRD)** : aucune trace d'IA de détection (AD-6 l'exclut explicitement), aucune récupération de code par email implicite (le seul "email" du spine concerne l'auth organisateurs, AD-8, sans rapport). Fidèle.
- **NFR résilience FR-8/FR-9** : Capability Map ligne 201 note explicitement "(statique, ne dépend pas de FR-9)". Fidèle.
- **Principe simplicité pour débutants** : omniprésent et correctement invoqué dans quasi tous les AD (AD-4, AD-5, AD-6, AD-9, AD-10).
