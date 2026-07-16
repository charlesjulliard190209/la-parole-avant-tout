"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Cibles de navigation.
const CHAT_HREF = "/discussion-anonyme";
// Route de la Story 4.2 : pas encore construite → 404 temporaire assumé
// (décision Fab, 2026-07-16) jusqu'à ce que la section « camarade exclu » existe.
const CAMARADE_HREF = "/camarade-exclu";

/**
 * En-tête « révélé au scroll ».
 *
 * En haut de la page il reste masqué pour laisser le hero (logo centré + nom)
 * respirer. Dès que le logo du hero quitte le viewport (l'élève a commencé à
 * défiler), l'en-tête glisse depuis le haut : logo cliquable + navigation + CTA.
 *
 * La détection s'appuie sur un IntersectionObserver posé sur un repère
 * (`#hero-logo-sentinel`) placé juste sous le logo du hero dans `app/page.tsx`.
 * Tant que ce repère est visible, on est « en haut » → en-tête masqué.
 */
export function SiteHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-logo-sentinel");
    // Sécurité : sans repère (ex. structure de page modifiée), on garde
    // l'en-tête masqué plutôt que de l'afficher en permanence.
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Repère hors du viewport (défilé vers le bas) → on affiche l'en-tête.
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      aria-hidden={!visible}
      // `inert` quand masqué : retire l'en-tête du parcours clavier ET des
      // technologies d'assistance (les liens/boutons ne sont plus focusables
      // tant que l'en-tête est hors écran). `pointer-events-none` ne suffit pas
      // (il ne bloque que la souris).
      inert={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" aria-label="Retour à l'accueil — La Parole Avant Tout">
          <Image
            src="/logo.png"
            alt="La Parole Avant Tout"
            width={102}
            height={38}
            className="h-9 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href={CHAT_HREF}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Discussion anonyme
          </Link>
          <Link
            href={CAMARADE_HREF}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Aider un camarade
          </Link>
          <Button asChild size="lg" className="h-10 px-5 text-sm">
            <Link href={CHAT_HREF}>Parler à quelqu&apos;un</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
