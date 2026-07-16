"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Navigation targets.
const CHAT_HREF = "/discussion-anonyme";
const CAMARADE_HREF = "/camarade-exclu";

/**
 * "Revealed on scroll" header.
 *
 * At the top of the page it stays hidden so the hero (centered logo + name)
 * can breathe. As soon as the hero logo leaves the viewport (the student
 * started scrolling), the header slides in from the top: clickable logo +
 * navigation + CTA.
 *
 * Detection relies on an IntersectionObserver watching a sentinel
 * (`#hero-logo-sentinel`) placed right below the hero logo in `app/page.tsx`.
 * While that sentinel is visible, we are "at the top" → header hidden.
 *
 * `alwaysVisible`: for pages WITHOUT a hero or sentinel (e.g. `/camarade-exclu`).
 * In that mode no observer is mounted and the header is shown permanently, in
 * normal flow (`sticky top-0`) — it pushes content down instead of covering
 * it, so pages need no compensating padding.
 */
export function SiteHeader({
  alwaysVisible = false,
}: {
  alwaysVisible?: boolean;
}) {
  // Scroll-driven visibility (hero mode). Ignored when `alwaysVisible`.
  const [scrolledVisible, setScrolledVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // "Always visible" mode: no sentinel to observe, nothing to do.
    if (alwaysVisible) return;

    const sentinel = document.getElementById("hero-logo-sentinel");
    // Safety: without a sentinel (e.g. page structure changed), keep the
    // header hidden rather than showing it permanently.
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sentinel out of the viewport (scrolled down) → show the header.
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
      // `inert` while hidden: removes the header from the keyboard flow AND
      // from assistive technologies (links/buttons are no longer focusable
      // while the header is off-screen). `pointer-events-none` is not enough
      // (it only blocks the mouse).
      inert={!visible}
      className={cn(
        "z-50 border-b border-border bg-background/90 backdrop-blur transition-all duration-300",
        // Hero mode: `fixed` header revealed on scroll. `alwaysVisible` mode:
        // `sticky` in normal flow, always shown.
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
          {/* CTA hidden on the chat page itself: a "Parler à quelqu'un"
              button that reloads the page you are already on is confusing
              (Fab's decision, 2026-07-16). The text link stays — flagged as
              the current page via aria-current. */}
          {pathname !== CHAT_HREF && (
            <Button asChild size="lg" className="h-10 px-5 text-sm">
              <Link href={CHAT_HREF}>Parler à quelqu&apos;un</Link>
            </Button>
          )}

          {/* Mobile menu: below `sm`, the text links above are hidden —
              without this menu, "Aider un camarade" would be unreachable on
              a phone. Side panel (Sheet, foundation 4.0) opened by a
              hamburger button, closed automatically when a link is chosen. */}
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

                {/* Light/dark toggle — deliberately kept to the mobile menu
                    only (no desktop toggle, Fab's decision 2026-07-16).
                    Outside SheetClose: the panel stays open so the theme
                    change can be seen applying. */}
                <div className="mt-2 border-t border-border pt-2">
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
