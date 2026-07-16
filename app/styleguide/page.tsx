import type { Metadata } from "next";

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

import { SheetDemo } from "./sheet-demo";

export const metadata: Metadata = {
  title: "Styleguide — La Parole Avant Tout",
  // Outil interne de validation visuelle : non indexable, non lié depuis la navigation.
  robots: { index: false, follow: false },
};

// Palette « Doux & rassurant » — les valeurs viennent des tokens de app/globals.css.
// On affiche la pastille via la variable CSS pour rester la source de vérité unique.
const PALETTE = [
  { name: "background", role: "Fond crème", cssVar: "--background", hex: "#FBF7F2" },
  { name: "foreground", role: "Texte brun profond", cssVar: "--foreground", hex: "#3A322C" },
  { name: "primary", role: "Terracotta profonde", cssVar: "--primary", hex: "#B35A38" },
  { name: "secondary", role: "Vert sauge", cssVar: "--secondary", hex: "#8AA391" },
  { name: "muted", role: "Crème sombre", cssVar: "--muted", hex: "#F0E9E1" },
  { name: "accent", role: "Sauge clair", cssVar: "--accent", hex: "#DCE6DE" },
  { name: "card", role: "Blanc chaud", cssVar: "--card", hex: "#FEFCFA" },
  { name: "border", role: "Beige", cssVar: "--border", hex: "#E7DDD2" },
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {title}
        </h2>
        <Separator />
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-extrabold text-foreground">
          Styleguide — Doux &amp; rassurant
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Page interne de validation visuelle de la fondation design (Story
          4.0). Elle n&apos;est liée depuis aucune navigation : accès direct par
          URL uniquement.
        </p>
      </header>

      {/* (a) Palette */}
      <Section title="Palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PALETTE.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className="h-20 w-full rounded-xl border border-border"
                style={{ backgroundColor: `var(${color.cssVar})` }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {color.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {color.role}
                </span>
                <span className="text-xs text-muted-foreground uppercase">
                  {color.hex}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* (b) Typographie */}
      <Section title="Typographie">
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
            Corps de texte en Nunito Sans — une police humaniste, chaleureuse et
            très lisible. C&apos;est la voix par défaut du site : douce,
            accessible et rassurante pour un public sensible.
          </p>
          <p className="text-sm text-muted-foreground">
            Légende / texte secondaire — plus discret, en brun grisé.
          </p>
        </div>
      </Section>

      {/* (c) Composants */}
      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Désactivé</Button>
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
                Exemple de contenu de carte reposant sur les tokens sémantiques
                (fond, bordure, texte) de la fondation.
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
                Radius large (0.9rem) pour un rendu doux et non-clinique.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
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

      <Section title="Séparateur">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Au-dessus du séparateur</p>
          <Separator />
          <p className="text-sm text-muted-foreground">En dessous du séparateur</p>
        </div>
      </Section>

      <Section title="Navigation mobile (Sheet)">
        <SheetDemo />
      </Section>
    </main>
  );
}
