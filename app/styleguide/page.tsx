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

import { FaviconAube, LogoAube, LogoAubeMark } from "./logo-aube";
import { SheetDemo } from "./sheet-demo";

export const metadata: Metadata = {
  title: "Design system « Aube » — La Parole Avant Tout",
  // Internal visual-validation tool: not indexable, not linked from any navigation.
  robots: { index: false, follow: false },
};

/*
  Direction « Aube » — candidate palette to replace « Doux & rassurant ».
  Source: https://colorhunt.co/palette/ffbe91ffddb0fffce1cfebff
  The four source colors are all very light, so dark anchors are derived
  from them for AA contrast (ink brown, deep peach, slate blue).

  IMPORTANT: this theme is scoped to this page only (.theme-aube overrides
  the CSS variables locally). Nothing changes in the rest of the app until
  the direction is validated; tokens are then promoted to app/globals.css.
*/

const SOURCE_COLORS = [
  { name: "Pêche", hex: "#FFBE91", role: "Chaleur — actions, présence de l'élève" },
  { name: "Abricot", hex: "#FFDDB0", role: "Accent doux — survols, mises en avant" },
  { name: "Ivoire", hex: "#FFFCE1", role: "Fond de page — lumière du matin" },
  { name: "Ciel", hex: "#CFEBFF", role: "Calme — l'équipe, informations" },
] as const;

const DERIVED_COLORS = [
  { name: "Encre brune", hex: "#453521", role: "Texte principal (contraste ≈ 11:1)" },
  { name: "Pêche profonde", hex: "#E1793B", role: "Focus, liens, ring" },
  { name: "Ardoise bleue", hex: "#1F4E6B", role: "Texte sur bleu ciel (≈ 7:1)" },
  { name: "Brique douce", hex: "#C04530", role: "Erreurs et signal de danger" },
] as const;

const TOKENS = [
  { name: "background", role: "Fond ivoire", cssVar: "--background", hex: "#FFFCE1" },
  { name: "foreground", role: "Encre brune", cssVar: "--foreground", hex: "#453521" },
  { name: "primary", role: "Pêche (CTA)", cssVar: "--primary", hex: "#FFA766" },
  { name: "secondary", role: "Bleu ciel", cssVar: "--secondary", hex: "#CFEBFF" },
  { name: "accent", role: "Abricot", cssVar: "--accent", hex: "#FFDDB0" },
  { name: "muted", role: "Ivoire dense", cssVar: "--muted", hex: "#FAF0C8" },
  { name: "card", role: "Blanc chaud", cssVar: "--card", hex: "#FFFEF7" },
  { name: "border", role: "Sable", cssVar: "--border", hex: "#F0E2C0" },
  { name: "destructive", role: "Brique douce", cssVar: "--destructive", hex: "#C04530" },
  { name: "ring", role: "Pêche profonde", cssVar: "--ring", hex: "#E1793B" },
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

function Swatch({
  name,
  hex,
  role,
}: {
  name: string;
  hex: string;
  role: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 w-full rounded-xl border border-border"
        style={{ backgroundColor: hex }}
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
        <span className="text-xs uppercase text-muted-foreground">{hex}</span>
      </div>
    </div>
  );
}

/* --- Chat preview (target rendering for app/discussion-anonyme) --- */

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

function ChatFormPreview() {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sg-chat-message">Ton message</Label>
          <Textarea
            id="sg-chat-message"
            rows={4}
            placeholder="Écris ce que tu as sur le cœur…"
          />
        </div>
        <Button className="w-full">Envoyer</Button>
      </div>
      <p
        role="status"
        className="rounded-xl border border-secondary bg-secondary/40 p-4 text-sm text-secondary-foreground"
      >
        Ton message a bien été envoyé. L&apos;équipe te répondra ici, sur cette
        page.
      </p>
      <p role="alert" className="text-sm font-medium text-destructive">
        Ton message n&apos;a pas pu être envoyé. Vérifie ta connexion et
        réessaie.
      </p>
    </div>
  );
}

function ModeChoicePreview() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Sauvegarder ma conversation</CardTitle>
        <CardDescription>
          Choisis un Code (6 à 20 lettres et/ou chiffres) pour retrouver ta
          conversation plus tard, même depuis un autre appareil.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="rounded-lg border border-accent bg-accent/50 p-3 text-sm font-medium text-accent-foreground">
          Ce Code est un secret : ne le partage avec personne, quiconque le
          connaît peut lire ta conversation.
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sg-code">Ton Code</Label>
          <Input id="sg-code" autoComplete="off" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Créer mon Code et sauvegarder</Button>
      </CardFooter>
    </Card>
  );
}

/* --- Admin preview (target rendering for app/organisateurs) --- */

function AdminPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Connexion organisateurs</CardTitle>
          <CardDescription>
            Espace réservé à l&apos;équipe d&apos;animation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-email">Email</Label>
            {/* autoComplete off: demo fields, keep browser autofill out. */}
            <Input id="sg-email" type="email" autoComplete="off" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-password">Mot de passe</Label>
            <Input id="sg-password" type="password" autoComplete="off" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Se connecter</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            Aperçu de la liste côté organisateurs, avec l&apos;alerte
            silencieuse.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="theme-aube min-h-dvh bg-background text-foreground">
      {/*
        Scoped theme override: redefines the semantic tokens locally so the
        new direction can be reviewed without touching the live app theme.
        Once validated, these values move to :root in app/globals.css.
      */}
      <style>{`
        .theme-aube {
          --background: #fffce1;
          --foreground: #453521;
          --card: #fffef7;
          --card-foreground: #453521;
          --popover: #fffef7;
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
        .theme-aube-dark {
          --background: #211a10;
          --foreground: #f3ead2;
          --card: #2b2315;
          --card-foreground: #f3ead2;
          --popover: #2b2315;
          --popover-foreground: #f3ead2;
          --primary: #ffbe91;
          --primary-foreground: #4a2c12;
          --secondary: #24384a;
          --secondary-foreground: #cfebff;
          --muted: #332a19;
          --muted-foreground: #c9b892;
          --accent: #3d2f1a;
          --accent-foreground: #ffddb0;
          --destructive: #e5674a;
          --border: #3e3420;
          --input: #3e3420;
          --ring: #ffbe91;
        }
        @media (prefers-color-scheme: dark) {
          .theme-aube {
            --background: #211a10;
            --foreground: #f3ead2;
            --card: #2b2315;
            --card-foreground: #f3ead2;
            --popover: #2b2315;
            --popover-foreground: #f3ead2;
            --primary: #ffbe91;
            --primary-foreground: #4a2c12;
            --secondary: #24384a;
            --secondary-foreground: #cfebff;
            --muted: #332a19;
            --muted-foreground: #c9b892;
            --accent: #3d2f1a;
            --accent-foreground: #ffddb0;
            --destructive: #e5674a;
            --border: #3e3420;
            --input: #3e3420;
            --ring: #ffbe91;
          }
        }
      `}</style>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Design system — proposition à valider
          </p>
          <h1 className="font-heading text-4xl font-extrabold text-foreground">
            Direction « Aube »
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Pêche, abricot, ivoire et bleu ciel : les couleurs d&apos;un jour
            qui se lève. La chaleur pêche accompagne l&apos;élève, le bleu ciel
            incarne le calme de l&apos;équipe. Ce thème est appliqué à cette
            page uniquement : rien ne change dans l&apos;app tant que la
            direction n&apos;est pas validée.
          </p>
          <p className="text-sm text-muted-foreground">
            Comparer avec la{" "}
            <Link
              href="/styleguide/v2"
              className="font-semibold text-secondary-foreground underline underline-offset-4"
            >
              v2 (fond blanc, cartes ivoire + mode sombre nuit bleutée)
            </Link>
            .
          </p>
        </header>

        <Section
          title="Palette source"
          lead="Les quatre couleurs de la palette Color Hunt, et les ancres foncées dérivées pour garantir un contraste AA."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SOURCE_COLORS.map((color) => (
              <Swatch key={color.name} {...color} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {DERIVED_COLORS.map((color) => (
              <Swatch key={color.name} {...color} />
            ))}
          </div>
        </Section>

        <Section
          title="Tokens sémantiques"
          lead="Le mapping shadcn/ui : ces valeurs remplaceront celles de app/globals.css après validation."
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
          lead="Réinterprétation SVG du logo : les deux bulles reprennent la signature du chat — ardoise bleue pour l'équipe, pêche profonde pour l'élève. Le favicon passe en bulles pleines pour rester lisible à 16 px."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Logo</CardTitle>
                <CardDescription>
                  SVG piloté par les tokens : il s&apos;adapte au thème (fichier
                  standalone : /logo-aube.svg).
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
                  Bulles pleines, couleurs fixes (fichier : /favicon-aube.svg).
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

        <Section
          title="Typographie"
          lead="Inchangée : Nunito pour les titres, Nunito Sans pour le corps — la rondeur reste au cœur de l'identité."
        >
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-4xl font-extrabold text-foreground">
              Titre H1 — Nunito
            </h1>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Titre H2 — Nunito
            </h2>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Titre H3 — Nunito
            </h3>
            <h4 className="font-heading text-xl font-semibold text-foreground">
              Titre H4 — Nunito
            </h4>
            <p className="max-w-2xl text-base text-foreground">
              Corps de texte en Nunito Sans — l&apos;encre brune remplace le
              noir : plus chaude, jamais clinique, avec un contraste d&apos;environ
              11:1 sur le fond ivoire.
            </p>
            <p className="text-sm text-muted-foreground">
              Légende / texte secondaire — brun doré discret, contraste AA.
            </p>
          </div>
        </Section>

        <Section title="Boutons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            {/*
              Target rendering for the link variant: slate blue instead of
              text-primary (the light peach fails AA on ivory). At migration
              time, button.tsx's `link` variant switches to
              text-secondary-foreground.
            */}
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
          <p className="max-w-2xl text-sm text-muted-foreground">
            Le bouton principal assume la pêche : fond clair, texte brun foncé
            (contraste ≈ 6:1) — plus doux qu&apos;un aplat saturé avec du texte
            blanc. Les liens passent en ardoise bleue, plus lisible que la
            pêche sur l&apos;ivoire.
          </p>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Signal de danger</Badge>
          </div>
        </Section>

        <Section title="Cartes">
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
                  Le blanc chaud des cartes se détache doucement du fond ivoire,
                  souligné par la bordure sable.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Commencer</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coins arrondis</CardTitle>
                <CardDescription>
                  Radius large (0.9rem) conservé — le rendu doux et
                  non-clinique fait partie de l&apos;identité.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Champs de formulaire">
          <div className="grid max-w-md gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sg-prenom">Prénom</Label>
              <Input id="sg-prenom" placeholder="Ton prénom (optionnel)" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sg-message">Message</Label>
              <Textarea
                id="sg-message"
                placeholder="Écris ce que tu as sur le cœur…"
                rows={4}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Chat anonyme — aperçu cible"
          lead="La signature de la direction : une conversation bicolore. L'élève parle en pêche (chaleur), l'équipe répond en bleu ciel (calme). Rendu cible pour discussion-anonyme."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ChatPreview />
            <ChatFormPreview />
          </div>
          <ModeChoicePreview />
        </Section>

        <Section
          title="Espace organisateurs — aperçu cible"
          lead="Rendu cible pour organisateurs : mêmes tokens que le site public, l'alerte silencieuse ressort en brique douce."
        >
          <AdminPreview />
        </Section>

        <Section title="Navigation mobile (Sheet)">
          <SheetDemo />
        </Section>

        <Section
          title="Mode sombre « Brun de nuit » — aperçu forcé"
          lead="Rendu quel que soit ton réglage macOS. Le pendant nocturne du fond ivoire : brun chaud profond, pêche lumineuse pour les actions, bulles élève en abricot nuit, équipe en bleu profond. À comparer avec la « Nuit bleutée » de la v2."
        >
          {/* Forced-dark frame: the .theme-aube-dark tokens apply inside regardless of the OS scheme. */}
          <div className="theme-aube-dark rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="flex flex-col gap-10 text-foreground">
              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">Logo</h3>
                {/* Token-driven SVG: switches to luminous peach + light blue here. */}
                <LogoAube className="w-full max-w-sm" />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">Boutons</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button disabled>Désactivé</Button>
                </div>
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
                  <ChatFormPreview />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-bold">
                  Espace organisateurs
                </h3>
                <AdminPreview />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Inventaire et plan d'application"
          lead="Ce qui existe, ce qui migre, ce qui manque — pour dérouler la mise à jour une fois la direction validée."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Composants shadcn installés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <li>badge, button, card</li>
                  <li>input, label, textarea</li>
                  <li>separator, sheet</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Tous stylés par tokens : la nouvelle palette s&apos;applique
                  sans les modifier.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Écrans à migrer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <li>
                    discussion-anonyme : fil, formulaire message, choix de
                    mode, récupération par Code
                  </li>
                  <li>organisateurs : accueil, connexion</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Ces écrans utilisent encore des gris zinc bruts : à basculer
                  sur les composants shadcn et les tokens.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Composants à ajouter</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <li>alert — erreurs et accusés de réception</li>
                  <li>skeleton — chargements du fil</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Via shadcn CLI, au moment de la migration du chat.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  );
}
