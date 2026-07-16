import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { FaviconAube, LogoAube, LogoAubeMark } from "../logo-aube";

export const metadata: Metadata = {
  title: "Design system « Aube » v2 — La Parole Avant Tout",
  // Internal visual-validation tool: not indexable, not linked from any navigation.
  robots: { index: false, follow: false },
};

/*
  Direction « Aube » — variante v2, to compare with /styleguide (v1).

  Differences vs v1:
  - Light mode inverts yellow and white: warm-white page background,
    ivory (#FFFCE1) cards — the palette color becomes the surface that
    "carries" content instead of the whole page.
  - Dark mode is a blue night sky derived from the palette's Ciel color
    (deep slate blue + luminous peach), instead of a yellowish brown.
    A forced-dark section below previews it regardless of the OS setting.

  Scoped to this page only (.theme-aube2), like v1.
*/

const TOKENS = [
  { name: "background", role: "Blanc chaud (inversé)", cssVar: "--background", hex: "#FFFEFA" },
  { name: "card", role: "Ivoire (inversé)", cssVar: "--card", hex: "#FFFCE1" },
  { name: "foreground", role: "Encre brune", cssVar: "--foreground", hex: "#453521" },
  { name: "primary", role: "Pêche (CTA)", cssVar: "--primary", hex: "#FFA766" },
  { name: "secondary", role: "Bleu ciel", cssVar: "--secondary", hex: "#CFEBFF" },
  { name: "accent", role: "Abricot", cssVar: "--accent", hex: "#FFDDB0" },
  { name: "muted", role: "Ivoire dense", cssVar: "--muted", hex: "#FAF0C8" },
  { name: "border", role: "Sable", cssVar: "--border", hex: "#F0E2C0" },
  { name: "destructive", role: "Brique douce", cssVar: "--destructive", hex: "#C04530" },
  { name: "ring", role: "Pêche profonde", cssVar: "--ring", hex: "#E1793B" },
] as const;

const DARK_TOKENS = [
  { name: "background", role: "Nuit bleutée", hex: "#16212B" },
  { name: "card", role: "Ardoise nuit", hex: "#1D2933" },
  { name: "foreground", role: "Ivoire doux", hex: "#EFEAE0" },
  { name: "primary", role: "Pêche lumineuse", hex: "#FFBE91" },
  { name: "secondary", role: "Bleu profond", hex: "#2B4257" },
  { name: "accent", role: "Abricot nuit", hex: "#3E3121" },
] as const;

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {title}
        </h2>
        {lead ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{lead}</p>
        ) : null}
        <Separator className="mt-2" />
      </div>
      {children}
    </section>
  );
}

/* --- Shared demo blocks (rendered in light, and re-used inside the forced-dark frame) --- */

const DEMO_MESSAGES = [
  {
    id: "1",
    sender: "eleve" as const,
    body: "Bonjour, je me sens un peu seul depuis le début du séjour…",
  },
  {
    id: "2",
    sender: "organisateur" as const,
    body: "Merci de nous avoir écrit, tu as bien fait. On est là pour toi. Est-ce que tu veux nous en dire un peu plus ?",
  },
  {
    id: "3",
    sender: "eleve" as const,
    body: "Les autres de la chambre ne me parlent pas trop. Hier ils sont partis à la veillée sans moi.",
  },
];

function ChatPreview() {
  return (
    <div className="flex flex-col gap-3">
      {DEMO_MESSAGES.map((message) => {
        const estEleve = message.sender === "eleve";
        return (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-xl border p-4 text-sm ${
              estEleve
                ? "self-end border-accent bg-accent/50 text-foreground"
                : "self-start border-secondary bg-secondary/50 text-foreground"
            }`}
          >
            <p
              className={`mb-1 text-xs font-semibold ${
                estEleve ? "text-accent-foreground" : "text-secondary-foreground"
              }`}
            >
              {estEleve ? "Toi" : "L'équipe"}
            </p>
            <p className="whitespace-pre-wrap">{message.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function ButtonsPreview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link" className="text-secondary-foreground">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Désactivé</Button>
      </div>
    </div>
  );
}

function FormPreview({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="grid max-w-md gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-prenom`}>Prénom</Label>
        <Input id={`${idPrefix}-prenom`} placeholder="Ton prénom (optionnel)" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-message`}>Message</Label>
        <Textarea
          id={`${idPrefix}-message`}
          placeholder="Écris ce que tu as sur le cœur…"
          rows={3}
        />
      </div>
      <Button className="w-full">Envoyer</Button>
    </div>
  );
}

function AdminListPreview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Conversation #A4F2
          </span>
          <span className="text-xs text-muted-foreground">
            Dernier message il y a 4 min
          </span>
        </div>
        <Badge variant="destructive">Signal de danger</Badge>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Conversation #B7C9
          </span>
          <span className="text-xs text-muted-foreground">
            Dernier message hier
          </span>
        </div>
        <Badge variant="secondary">En cours</Badge>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Conversation #C1D8
          </span>
          <span className="text-xs text-muted-foreground">
            Aucune réponse attendue
          </span>
        </div>
        <Badge variant="outline">Fermée</Badge>
      </div>
    </div>
  );
}

export default function StyleguideV2Page() {
  return (
    <div className="theme-aube2 min-h-dvh bg-background text-foreground">
      {/*
        Scoped theme override, v2. `.theme-aube2` swaps yellow and white in
        light mode; `.theme-aube2-dark` force-applies the night-blue dark
        tokens so the dark direction can be reviewed on a light OS. The same
        night values also apply page-wide under the `.dark` class (set by
        next-themes from the OS preference or the mobile-menu toggle).
      */}
      <style>{`
        .theme-aube2 {
          --background: #fffefa;
          --foreground: #453521;
          --card: #fffce1;
          --card-foreground: #453521;
          --popover: #fffefa;
          --popover-foreground: #453521;
          --primary: #ffa766;
          --primary-foreground: #50310f;
          --secondary: #cfebff;
          --secondary-foreground: #1f4e6b;
          --muted: #faf0c8;
          --muted-foreground: #76644a;
          --accent: #ffddb0;
          --accent-foreground: #5a3a15;
          --destructive: #c04530;
          --border: #f0e2c0;
          --input: #e9d8b2;
          --ring: #e1793b;
        }
        .theme-aube2-dark {
          --background: #16212b;
          --foreground: #efeae0;
          --card: #1d2933;
          --card-foreground: #efeae0;
          --popover: #1d2933;
          --popover-foreground: #efeae0;
          --primary: #ffbe91;
          --primary-foreground: #4a2c12;
          --secondary: #2b4257;
          --secondary-foreground: #cfebff;
          --muted: #223039;
          --muted-foreground: #a9bac6;
          --accent: #3e3121;
          --accent-foreground: #ffddb0;
          --destructive: #e5674a;
          --border: #2d3c48;
          --input: #2d3c48;
          --ring: #ffbe91;
        }
        /* .dark .theme-aube2 (et non prefers-color-scheme) : next-themes
           pose la classe sur <html> pour la préférence OS comme pour le
           toggle du menu mobile — l'aperçu reste synchronisé avec le site. */
        .dark .theme-aube2 {
          --background: #16212b;
          --foreground: #efeae0;
          --card: #1d2933;
          --card-foreground: #efeae0;
          --popover: #1d2933;
          --popover-foreground: #efeae0;
          --primary: #ffbe91;
          --primary-foreground: #4a2c12;
          --secondary: #2b4257;
          --secondary-foreground: #cfebff;
          --muted: #223039;
          --muted-foreground: #a9bac6;
          --accent: #3e3121;
          --accent-foreground: #ffddb0;
          --destructive: #e5674a;
          --border: #2d3c48;
          --input: #2d3c48;
          --ring: #ffbe91;
        }
      `}</style>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Design system — proposition v2
          </p>
          <h1 className="font-heading text-4xl font-extrabold text-foreground">
            « Aube » v2 — blanc &amp; ivoire inversés
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Le fond de page passe en blanc chaud et l&apos;ivoire descend sur
            les cartes : la couleur porte le contenu au lieu d&apos;envahir la
            page. Le mode sombre devient une nuit bleutée dérivée du Ciel de la
            palette.
          </p>
          <p className="text-sm text-muted-foreground">
            Comparer avec la{" "}
            <Link
              href="/styleguide"
              className="font-semibold text-secondary-foreground underline underline-offset-4"
            >
              v1 (fond ivoire)
            </Link>
            .
          </p>
        </header>

        <Section
          title="Tokens v2 — mode clair"
          lead="Seuls background, card et popover changent par rapport à la v1 : le reste de la palette est identique."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {TOKENS.map((token) => (
              <div key={token.name} className="flex flex-col gap-2">
                <div
                  className="h-14 w-full rounded-xl border border-border"
                  style={{ backgroundColor: `var(${token.cssVar})` }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {token.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {token.role}
                  </span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {token.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Logo & favicon"
          lead="Le logo SVG suit les tokens : sur fond blanc les bulles gardent tout leur relief. Favicon en bulles pleines, lisible à 16 px."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Logo</CardTitle>
                <CardDescription>
                  Ardoise bleue pour l&apos;équipe, pêche profonde pour
                  l&apos;élève, encre brune pour le nom.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <LogoAube className="w-full max-w-md" />
                <LogoAubeMark className="h-16 w-16" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Favicon</CardTitle>
                <CardDescription>
                  Couleurs fixes (fichier : /favicon-aube.svg).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <FaviconAube className="h-16 w-16" />
                  <span className="text-xs text-muted-foreground">64 px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FaviconAube className="h-8 w-8" />
                  <span className="text-xs text-muted-foreground">32 px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FaviconAube className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">16 px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <FaviconAube className="h-10 w-10" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tuile iOS
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Boutons">
          <ButtonsPreview />
        </Section>

        <Section
          title="Cartes"
          lead="C'est ici que l'inversion se voit le plus : les cartes deviennent ivoire sur fond blanc."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Besoin de parler ?</CardTitle>
                <CardDescription>
                  Un espace anonyme et bienveillant pour se confier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  L&apos;ivoire réchauffe chaque bloc de contenu, la page reste
                  légère et respirante.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Commencer</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>
                  Mêmes composants, mêmes tokens que la v1.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Signal de danger</Badge>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Champs de formulaire">
          <FormPreview idPrefix="sg2" />
        </Section>

        <Section
          title="Chat anonyme — aperçu cible"
          lead="La conversation bicolore, sur fond blanc cette fois : pêche pour l'élève, bleu ciel pour l'équipe."
        >
          <div className="max-w-xl">
            <ChatPreview />
          </div>
        </Section>

        <Section
          title="Espace organisateurs — aperçu cible"
          lead="La liste des conversations sur fond blanc, cartes ivoire, alerte silencieuse en brique douce."
        >
          <div className="max-w-xl">
            <AdminListPreview />
          </div>
        </Section>

        <Section
          title="Mode sombre « Nuit bleutée » — aperçu forcé"
          lead="Rendu quel que soit ton réglage macOS. La nuit d'avant l'aube : bleu ardoise profond dérivé du Ciel, pêche lumineuse pour les actions, bulles élève en abricot nuit."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
            {DARK_TOKENS.map((token) => (
              <div key={token.name} className="flex flex-col gap-2">
                <div
                  className="h-14 w-full rounded-xl border border-border"
                  style={{ backgroundColor: token.hex }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {token.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {token.role}
                  </span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {token.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Forced-dark frame: the night tokens apply inside regardless of the OS scheme. */}
          <div className="theme-aube2-dark rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="flex flex-col gap-10 text-foreground">
              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">Logo</h3>
                {/* Token-driven SVG: switches to luminous peach + light blue here. */}
                <LogoAube className="w-full max-w-sm" />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">Boutons</h3>
                <ButtonsPreview />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading text-xl font-bold">
                    Chat anonyme
                  </h3>
                  <ChatPreview />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading text-xl font-bold">
                    Formulaire
                  </h3>
                  <FormPreview idPrefix="sg2-dark" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">
                  Espace organisateurs
                </h3>
                <AdminListPreview />
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
