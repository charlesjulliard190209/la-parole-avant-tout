# Revue de versions — Stack technique (ARCHITECTURE-SPINE.md)

**Date de vérification :** 2026-07-08
**Méthode :** recherche web en direct (WebSearch/WebFetch) sur chaque ligne du tableau Stack, section ARCHITECTURE-SPINE.md.

## Verdict global

Toutes les technologies nommées existent toujours, ne sont ni abandonnées ni renommées, et les numéros de version cités sont plausibles/actuels pour le 2026-07-08. Les affirmations sur les offres gratuites (Vercel Hobby non-commercial, Supabase gratuit, Telegram Bot API gratuite) sont confirmées par les sources officielles. Un point mérite d'être ajouté aux Deferred/risques : la pause automatique du projet Supabase gratuit après 7 jours d'inactivité, incompatible avec un service devant rester disponible en continu pour un chat élève.

## Détail par ligne du tableau Stack

### Next.js (App Router) — 16.2.10 LTS
- **Statut :** confirmé, à jour.
- Next.js a bien une politique officielle de LTS documentée sur https://nextjs.org/support-policy (Active LTS puis Maintenance LTS pendant 2 ans après la sortie de la version majeure suivante). Next.js 16 est sorti le 21 octobre 2025 et reste la version majeure active (pas de Next.js 17 à ce jour) : "16.2.10 LTS" est donc une désignation cohérente avec la politique officielle du projet, pas une invention d'un site tiers.
- 16.2.10 apparaît comme dernière version publiée sur npm (republication de `@next/swc-wasm-web`, corrige un paquet non publié depuis 16.2.4).
- Aucun signal de dépréciation ou de renommage du framework.
- Sources : [nextjs.org/support-policy](https://nextjs.org/support-policy), [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16), [npmjs.com/package/next](https://www.npmjs.com/package/next), [eosl.date/eol/product/nextjs](https://eosl.date/eol/product/nextjs/)

### Node.js — 24 (LTS active)
- **Statut :** confirmé, à jour.
- Node.js 24 ("Krypton") est entré en Active LTS le 2025-05-06, passera en Maintenance LTS le 2026-10-20, et est bien la ligne LTS active recommandée pour les nouveaux projets à la date du 2026-07-08.
- Note pour info (pas un problème pour le projet) : Node.js change de cadence de publication à partir d'octobre 2026 (numérotation calée sur l'année civile, une seule majeure par an) — n'affecte pas la validité du choix "Node 24" aujourd'hui.
- Aucun signal d'abandon ou de renommage.
- Sources : [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases), [endoflife.date/nodejs](https://endoflife.date/nodejs)

### TypeScript — dernière stable (fournie par le starter Next.js)
- **Statut :** formulation non versionnée, donc rien à contredire ; cohérent avec le fait que `create-next-app` installe TypeScript automatiquement. Next.js 16 exige TypeScript ≥ 5.1.0 au minimum, ce qui est compatible avec "dernière stable". Pas de red flag.

### Tailwind CSS — 4.3.2
- **Statut :** confirmé, à jour.
- 4.3.2 est la dernière version publiée sur npm au moment de la vérification (~8 jours avant la recherche). Tailwind CSS v4 (architecture Oxide/moteur Rust) est la ligne active ; pas de renommage ni d'abandon du projet.
- Sources : [npmjs.com/package/tailwindcss](https://www.npmjs.com/package/tailwindcss?activeTab=versions), [tailwindcss.com/blog/tailwindcss-v4-3](https://tailwindcss.com/blog/tailwindcss-v4-3)

### @supabase/supabase-js — 2.110.1
- **Statut :** confirmé, à jour (dernière version publiée sur npm au moment de la recherche, quelques heures avant la vérification).
- Point d'attention technique (pas une erreur de version, mais à vérifier lors de l'implémentation) : le support de Node.js 20 a été abandonné à partir de la 2.110.0. Sans incidence ici puisque le spine cible Node.js 24.
- Package toujours actif, pas de renommage.
- Source : [npmjs.com/package/@supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js)

### Supabase Postgres — managé, plan gratuit
- **Statut :** confirmé mais avec une réserve à signaler.
- Le plan gratuit Supabase existe toujours en 2026 : 2 projets actifs, 500 Mo de base de données, 5 Go d'egress, 50 000 utilisateurs actifs mensuels (Auth), 1 Go de stockage fichiers, requêtes API illimitées, pas de SLA ni de sauvegardes quotidiennes.
- **Réserve importante :** les projets gratuits **se mettent en pause automatiquement après 7 jours d'inactivité**. Pour un chat anonyme censé recevoir des messages en continu (potentiellement avec des creux d'activité, ex. vacances scolaires), ce comportement peut interrompre le service sans notification visible côté élève. Ce point n'est pas mentionné dans le spine ni dans les "Deferred" — à considérer comme un risque opérationnel à trancher (upgrade payant Supabase, ou mécanisme de keep-alive) avant lancement public, dans le même esprit que les autres points déjà listés en Deferred (ex. "canal de secours si Telegram tombe en panne").
- Pas de renommage/abandon du produit Supabase.
- Source : synthèse de plusieurs guides de tarification 2026 recoupés avec [supabase.com/pricing](https://supabase.com/pricing) (contenu non re-vérifié directement par fetch, mais convergent sur plusieurs sources indépendantes).

### Hébergement — Vercel, plan Hobby, gratuit, usage non-commercial
- **Statut :** confirmé directement via la documentation officielle Vercel (vercel.com/docs/plans/hobby, dernière mise à jour 2026-06-16, donc quasiment à la date d'aujourd'hui).
- Citation officielle : "the Hobby plan restricts users to non-commercial, personal use only" (renvoi vers /docs/limits/fair-use-guidelines#commercial-usage).
- Le plan reste gratuit avec des quotas généreux (1M requêtes Edge, 4 CPU-hrs actives, 300s max par fonction, previews de PR gratuites incluses — cohérent avec AD-10 du spine).
- Vercel se réserve le droit de désactiver un projet Hobby utilisé commercialement, sans préavis — cohérent avec la remarque du spine "usage non-commercial".
- Aucun changement de nom ou de statut du produit.
- Source : [vercel.com/docs/plans/hobby](https://vercel.com/docs/plans/hobby) (fetch direct, page datée 2026-06-16)

### Notification — API Telegram Bot (HTTPS, gratuite, sans SDK)
- **Statut :** confirmé, à jour.
- L'API Bot Telegram (core.telegram.org/bots/api) reste entièrement gratuite : pas de frais par message, pas d'abonnement, HTTPS natif via webhook (POST) ou long-polling, aucun SDK requis (appels HTTP directs), cohérent avec AD-7 et AD-3 du spine (appel serveur sortant simple).
- Seule exception tarifaire connue : les diffusions au-delà de 30 messages/seconde peuvent être facturées en Stars — sans rapport avec ce projet (2 destinataires fixes, volume trivial).
- Aucun signal d'abandon ou de changement de modèle économique de la plateforme Telegram Bot API.
- Sources : [core.telegram.org/bots/api](https://core.telegram.org/bots/api), synthèse de guides tarifaires 2026 convergents.

## Aucun produit obsolète, abandonné ou renommé détecté

Toutes les technologies citées (Next.js, Node.js, TypeScript, Tailwind CSS, Supabase, Vercel, Telegram Bot API) sont actives, maintenues, et correctement nommées. Aucune ne doit être remplacée.

## Recommandation

Ajouter au bloc **Deferred** du spine (ou à une note opérationnelle) le risque de mise en pause automatique du projet Supabase gratuit après 7 jours d'inactivité, avec une décision explicite à prendre avant le lancement public (upgrade payant vs. tâche de ping planifiée) — dans la continuité de la logique déjà appliquée aux autres risques différés (ex. canal de secours Telegram).
