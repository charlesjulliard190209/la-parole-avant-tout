import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Section dédiée au deuxième profil (FR-13) — l'élève sollicité par un camarade
// mis à l'écart (persona « Léo », PRD UJ-5) qui cherche à répondre avec respect
// sans se sentir obligé d'accepter une amitié non désirée. Server Component
// purement présentationnel : aucune donnée, aucun accès Supabase. Style bâti
// sur la fondation « Doux & rassurant » (Story 4.0) via les tokens sémantiques.

// Cible du chat anonyme — même mécanisme que pour tout le monde (PRD UJ-5).
const CHAT_HREF = "/discussion-anonyme";
const CHAT_CTA_LABEL = "Pose ta question, anonymement";

// Repères éditoriaux (base validée avec Charles au checkpoint de la 4.2).
// Contenu inline (NFR-1) : pas d'abstraction pour quatre paragraphes.
const REPERES = [
  {
    title: "Tu as le droit de poser tes limites",
    body: "Ne pas vouloir d'une amitié, ce n'est pas du harcèlement, et ce n'est pas être quelqu'un de mauvais. Tu peux dire non à une relation sans rejeter la personne. Ce qui compte, c'est comment tu le dis.",
  },
  {
    title: "Dire non avec respect",
    body: "Reste simple et honnête, sans humilier : pas de moqueries, pas de silence méprisant, pas de « non » lancé devant tout le monde. Une phrase calme et directe suffit — tu peux décliner une invitation tout en disant bonjour le lendemain.",
  },
  {
    title: "Les petits gestes comptent (et ne t'engagent à rien)",
    body: "Dire bonjour, ne pas rire quand les autres se moquent, ne pas relayer les rumeurs, adresser la parole normalement en classe. Ces gestes ne font pas de toi son meilleur ami — ils font juste de toi quelqu'un de respectueux, et pour un élève isolé ils changent beaucoup.",
  },
  {
    title: "Ne pas participer, c'est déjà agir",
    body: "Si tu vois de l'exclusion ou des moqueries, tu n'as pas à devenir un héros : ne pas t'y joindre, changer de sujet, ou simplement rester correct avec la personne, c'est déjà une vraie différence.",
  },
];

export const metadata: Metadata = {
  title: "Aider un camarade — La Parole Avant Tout",
  description:
    "Des repères pour répondre avec respect à un camarade mis à l'écart, sans te sentir obligé — et le chat anonyme si tu préfères poser ta question.",
};

export default function CamaradeExclu() {
  return (
    <>
      {/* En-tête toujours visible : cette page n'a pas de hero ni de repère
          `#hero-logo-sentinel`. Rendu HORS de <main> pour conserver le rôle
          landmark « banner ». */}
      <SiteHeader alwaysVisible />

      <main className="flex flex-1 flex-col bg-background text-foreground">
        {/* Intro : titre + chapeau + illustration (ado pensif — persona Léo,
            reprise du site Wix d'origine). Un seul h1 sur la page. */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-12 pt-14 sm:pt-16">
          <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
            <Reveal variant="rise" className="flex flex-col gap-5">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Aider un camarade, à ta façon
              </h1>
              <p className="text-lg leading-8 text-muted-foreground sm:text-xl">
                Un camarade mis à l&apos;écart cherche ton amitié, et tu ne sais
                pas comment réagir&nbsp;? Tu n&apos;es pas obligé de devenir son
                ami pour être respectueux. Voici quelques repères.
              </p>
            </Reveal>
            <Reveal
              variant="wipe"
              direction="left"
              delay={150}
              className="relative aspect-[4/3] w-full"
              innerClassName="overflow-hidden rounded-[var(--radius)] ring-1 ring-border"
            >
              <Image
                src="/camarade-illustration.jpeg"
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
                priority
              />
            </Reveal>
          </div>
        </section>

        {/* Les repères — bande apaisante distincte. Chaque repère est un h2. */}
        <section className="bg-accent">
          <div className="mx-auto w-full max-w-5xl px-6 py-14">
            <div className="grid gap-5 sm:grid-cols-2">
              {REPERES.map((repere, index) => (
                <Reveal
                  key={repere.title}
                  variant="rise"
                  delay={index * 100}
                  className="h-full"
                >
                  <Card className="h-full">
                    <CardContent className="flex flex-col gap-2">
                      <h2 className="font-heading text-xl font-bold text-foreground">
                        {repere.title}
                      </h2>
                      <p className="text-base leading-7 text-muted-foreground">
                        {repere.body}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Et si tu ne sais pas quoi faire ? — le chat en complément (jamais un
            substitut), même mécanisme et même anonymat que pour tout le monde.
            Illustration bulle + cadenas (anonymat) reprise du site Wix d'origine. */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
            <Reveal
              variant="wipe"
              direction="right"
              delay={150}
              className="relative aspect-square w-full max-w-sm justify-self-center sm:order-first"
              innerClassName="overflow-hidden rounded-[var(--radius)] ring-1 ring-border"
            >
              <Image
                src="/chat-anonyme-illustration.jpeg"
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            </Reveal>
            <Reveal variant="rise" className="flex flex-col gap-3 text-center sm:text-left">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Et si tu ne sais pas quoi faire&nbsp;?
              </h2>
              <p className="text-lg text-muted-foreground">
                Chaque situation est particulière. Tu peux nous poser ta question
                sur le chat, anonymement — personne ne saura qui tu es, et une
                vraie personne du lycée te répondra.
              </p>
              <div className="mt-3 flex flex-col items-center gap-3 sm:items-start">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href={CHAT_HREF}>{CHAT_CTA_LABEL}</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Anonyme, sans inscription. Une vraie personne du lycée te répond
                  — pas un robot.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer identique à celui de l'accueil — hors de <main> pour conserver
          le rôle landmark « contentinfo ». */}
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
