import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

// Vitrine (FR-12) — porte d'entrée vers le chat anonyme déjà fonctionnel
// (app/discussion-anonyme). Server Component purement présentationnel : aucune
// donnée, aucun accès Supabase. Style entièrement bâti sur la fondation
// « Doux & rassurant » (Story 4.0) via les tokens sémantiques + composants ui.

// Cible unique de tous les appels à l'action de la page : le chat fonctionnel.
const CHAT_HREF = "/discussion-anonyme";
const CTA_LABEL = "Parler à quelqu'un";

export default function Home() {
  return (
    <>
      {/* En-tête révélé au scroll (îlot client). Masqué en haut de page pour
          laisser le hero centré respirer ; il glisse depuis le haut dès que le
          logo du hero quitte le viewport. Rendu HORS de <main> pour conserver
          le rôle landmark « banner » (un <header> descendant de <main> le perd). */}
      <SiteHeader />

      <main className="flex flex-1 flex-col bg-background text-foreground">
        {/* Hero : logo + nom du site + phrase d'identité + CTA au-dessus de la
            ligne de flottaison (mobile et desktop). */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          {/* Logo décoratif ici : le nom du site est repris juste en dessous en
              texte (visuellement masqué pour éviter le doublon), inutile de le
              faire annoncer deux fois par les lecteurs d'écran. */}
          <Logo aria-hidden="true" className="h-24 w-auto sm:h-28" />
          {/* Repère observé par SiteHeader : tant qu'il est visible, on est « en
              haut » (en-tête masqué). Dès qu'il passe au-dessus du viewport
              (logo défilé), l'en-tête apparaît. */}
          <div id="hero-logo-sentinel" aria-hidden="true" className="h-px w-px" />
          <h1 className="sr-only">La Parole Avant Tout</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Nous sommes deux élèves du Lycée Français Charles de Gaulle, engagés
            contre le harcèlement scolaire. Ici, tu as un espace de parole
            solidaire, sûr et bienveillant — écris-nous en toute confiance.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href={CHAT_HREF}>{CTA_LABEL}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Anonyme, sans inscription. Une vraie personne du lycée te répond —
              pas un robot.
            </p>
          </div>
        </section>

        {/* Message phare — bande apaisante distincte. */}
        <section className="bg-accent">
          <Reveal
            variant="rise"
            className="mx-auto w-full max-w-3xl px-6 py-14 text-center"
          >
            <p className="font-heading text-2xl font-bold leading-snug text-foreground sm:text-3xl">
              S&apos;exprimer est le premier pas vers le changement.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-foreground/80">
              Ici, ta parole est précieuse, protégée et écoutée avec la plus
              grande bienveillance.
            </p>
          </Reveal>
        </section>

        {/* Section mission — texte + illustration (groupe qui échange). */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
            <Reveal variant="rise" className="flex flex-col gap-4">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Libérer la parole pour combattre l&apos;isolement
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Notre mission : briser le silence qui entoure le harcèlement
                scolaire. Ici, tu as un refuge anonyme et sécurisé pour t&apos;exprimer
                librement, et une vraie personne du lycée te lit et te répond. En
                mettant des mots sur les maux, on construit ensemble un quotidien
                scolaire plus sain et plus solidaire.
              </p>
            </Reveal>
            <Reveal
              variant="wipe"
              direction="left"
              delay={150}
              className="relative aspect-[4/3] w-full"
              innerClassName="overflow-hidden rounded-[var(--radius)] bg-muted ring-1 ring-border"
            >
              <Image
                src="/mission-illustration.jpeg"
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            </Reveal>
          </div>
        </section>

        {/* Section « pourquoi » — illustration (isolement) + texte. */}
        <section className="bg-muted">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
              <Reveal
                variant="wipe"
                direction="right"
                delay={150}
                className="relative aspect-[4/3] w-full sm:order-first"
                innerClassName="overflow-hidden rounded-[var(--radius)] bg-card ring-1 ring-border"
              >
                <Image
                  src="/pourquoi-illustration.jpeg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              </Reveal>
              <Reveal variant="rise" className="flex flex-col gap-4">
                <h2 className="font-heading text-3xl font-bold text-foreground">
                  Pourquoi est-il crucial de libérer ta parole&nbsp;?
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  Garder ses émotions pour soi peut devenir un poids immense. Ici,
                  chaque ressenti mérite d&apos;être entendu. S&apos;exprimer, c&apos;est
                  briser le cercle de l&apos;intimidation et reprendre confiance en
                  soi. On est là pour t&apos;écouter sans jugement&nbsp;: mettre des
                  mots sur ce que tu vis est la première étape vers un quotidien
                  plus léger et plus serein.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Appel à l'action final — le chat est disponible maintenant. */}
        <section className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
          <Reveal variant="rise">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Tu as quelque chose sur le cœur&nbsp;?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
              Écris-nous dès maintenant. C&apos;est anonyme, et une vraie personne
              du lycée te répondra avec bienveillance.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href={CHAT_HREF}>{CTA_LABEL}</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer — hors de <main> pour conserver le rôle landmark « contentinfo ». */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center">
          <Logo className="h-9 w-auto" />
          <p className="text-sm text-muted-foreground">
            La Parole Avant Tout © 2026
          </p>
        </div>
      </footer>
    </>
  );
}
