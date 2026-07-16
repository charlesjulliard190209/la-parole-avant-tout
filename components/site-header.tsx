"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
 *
 * `alwaysVisible` : pour les pages SANS hero ni repère (ex. `/camarade-exclu`).
 * Dans ce mode, aucun observer n'est monté et l'en-tête est affiché en
 * permanence, en flux normal (`sticky top-0`) — il pousse donc le contenu vers
 * le bas au lieu de le recouvrir, sans padding compensatoire à gérer côté page.
 */
export function SiteHeader({
  alwaysVisible = false,
}: {
  alwaysVisible?: boolean;
}) {
  // Visibilité pilotée par le scroll (mode hero). Ignorée si `alwaysVisible`.
  const [scrolledVisible, setScrolledVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Mode « toujours visible » : pas de repère à observer, rien à faire.
    if (alwaysVisible) return;

    const sentinel = document.getElementById("hero-logo-sentinel");
    // Sécurité : sans repère (ex. structure de page modifiée), on garde
    // l'en-tête masqué plutôt que de l'afficher en permanence.
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Repère hors du viewport (défilé vers le bas) → on affiche l'en-tête.
        setScrolledVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [alwaysVisible]);

  const visible = alwaysVisible || scrolledVisible;

  return (
    <header
      aria-hidden={!visible}
      // `inert` quand masqué : retire l'en-tête du parcours clavier ET des
      // technologies d'assistance (les liens/boutons ne sont plus focusables
      // tant que l'en-tête est hors écran). `pointer-events-none` ne suffit pas
      // (il ne bloque que la souris).
      inert={!visible}
      className={cn(
        "z-50 border-b border-border bg-background/90 backdrop-blur transition-all duration-300",
        // Mode hero : en-tête `fixed` révélé au scroll. Mode `alwaysVisible` :
        // `sticky` en flux normal, toujours affiché.
        alwaysVisible
          ? "sticky top-0 translate-y-0 opacity-100"
          : cn(
              "fixed inset-x-0 top-0",
              scrolledVisible
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-full opacity-0"
            )
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" aria-label="Retour à l'accueil — La Parole Avant Tout">
          {/* Decorative here: the link already carries the accessible name. */}
          <Logo aria-hidden="true" className="h-9 w-auto" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          <Link
            href={CHAT_HREF}
            aria-current={pathname === CHAT_HREF ? "page" : undefined}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground sm:inline"
          >
            Discussion anonyme
          </Link>
          <Link
            href={CAMARADE_HREF}
            aria-current={pathname === CAMARADE_HREF ? "page" : undefined}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground sm:inline"
          >
            Aider un camarade
          </Link>
          <Button asChild size="lg" className="h-10 px-5 text-sm">
            <Link href={CHAT_HREF}>Parler à quelqu&apos;un</Link>
          </Button>

          {/* Menu mobile : sous `sm`, les liens texte ci-dessus sont masqués —
              sans ce menu, « Aider un camarade » serait inatteignable sur
              téléphone. Panneau latéral (Sheet, fondation 4.0) ouvert par un
              bouton hamburger, fermé automatiquement au choix d'un lien. */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:hidden"
                aria-label="Ouvrir le menu"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-12 flex flex-col gap-2 px-4">
                <SheetClose asChild>
                  <Link
                    href={CHAT_HREF}
                    aria-current={pathname === CHAT_HREF ? "page" : undefined}
                    className="rounded-[var(--radius)] px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:text-foreground"
                  >
                    Discussion anonyme
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href={CAMARADE_HREF}
                    aria-current={
                      pathname === CAMARADE_HREF ? "page" : undefined
                    }
                    className="rounded-[var(--radius)] px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:text-foreground"
                  >
                    Aider un camarade
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
