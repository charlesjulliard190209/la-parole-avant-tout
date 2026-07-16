"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "wipe" | "rise";

// Sens du balayage pour le variant « wipe ».
type WipeDirection = "left" | "right";

type RevealProps = {
  children: React.ReactNode;
  /**
   * "wipe" : balayage (clip-path) — pour les images/visuels.
   * "rise" : montée douce (léger translate + opacité) — pour les blocs de texte.
   */
  variant?: RevealVariant;
  /** Sens du balayage (variant "wipe" uniquement). Par défaut : depuis la gauche. */
  direction?: WipeDirection;
  /** Délai avant le démarrage de l'animation (ms) — utile pour échelonner texte puis image. */
  delay?: number;
  className?: string;
  /**
   * Classes appliquées à l'élément interne animé (variant "wipe" uniquement).
   * On y met le cadrage visuel (bord, coins arrondis, overflow) pour qu'il soit
   * balayé AVEC l'image — et non affiché en cadre vide avant la révélation.
   */
  innerClassName?: string;
};

// États clip-path du balayage : caché (bande nulle) → révélé (pleine largeur).
const WIPE_HIDDEN: Record<WipeDirection, string> = {
  left: "inset(0 100% 0 0)", // révèle de la gauche vers la droite
  right: "inset(0 0 0 100%)", // révèle de la droite vers la gauche
};

// Hook partagé : passe `visible` à true quand l'élément entre dans le viewport
// (une seule fois), et `animate` à true après montage (pour poser l'état
// « caché » avant de lancer la transition).
//
// Important : l'élément OBSERVÉ ne doit pas être celui qui porte le clip-path.
// Un élément réduit à une aire nulle par `clip-path` n'est jamais détecté comme
// visible par l'IntersectionObserver → le variant « wipe » observe donc un
// conteneur externe non clippé, et anime un enfant.
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect de la préférence système : pas d'animation → tout visible d'emblée.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Déjà visible au montage (au-dessus de la ligne de flottaison) :
          // `animate` est resté false → affichage direct, sans transition ni
          // flash. Devenu visible au scroll : `animate` a été posé plus tôt →
          // l'apparition s'anime.
          setVisible(true);
          observer.disconnect(); // une seule fois
        } else {
          // Pas encore visible : on pose l'état « caché » animé pour préparer
          // l'apparition. Le contenu est hors écran → aucun flash perceptible.
          setAnimate(true);
        }
      },
      // threshold 0 : se déclenche dès qu'un pixel entre (moins le rootMargin),
      // robuste même quand le bloc est plus haut que le viewport (sinon un seuil
      // élevé pourrait n'être jamais atteint → contenu jamais révélé).
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible, animate };
}

/**
 * Révèle son contenu quand il entre dans le viewport (une seule fois).
 *
 * Effet inspiré de l'ancien site Wix : le texte monte doucement, les images
 * apparaissent en « wipe » (balayage) plutôt qu'en simple fondu.
 *
 * Accessibilité : si l'utilisateur a demandé « réduire les animations »
 * (prefers-reduced-motion), le contenu s'affiche immédiatement, sans animation.
 * Sans JavaScript, le contenu reste visible (état initial neutre côté rendu).
 */
export function Reveal({
  children,
  variant = "rise",
  direction = "left",
  delay = 0,
  className,
  innerClassName,
}: RevealProps) {
  const { ref, visible, animate } = useReveal();

  if (variant === "wipe") {
    // Conteneur externe = cible observée (jamais clippée), qui porte la
    // taille (relative + aspect + ordre grille). L'enfant porte le balayage ET
    // le cadrage visuel (`innerClassName` : bord, coins arrondis, overflow),
    // pour que le cadre apparaisse avec l'image et non en amont.
    const wipeStyle: CSSProperties = animate
      ? {
          clipPath: visible ? "inset(0 0 0 0)" : WIPE_HIDDEN[direction],
          transition: "clip-path 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: `${delay}ms`,
        }
      : {};

    return (
      // `relative` forcé : l'enfant animé est `absolute inset-0` et doit se
      // positionner par rapport à ce conteneur, sans dépendre du fait que
      // l'appelant pense à passer `relative`.
      <div ref={ref} className={cn("relative", className)}>
        <div
          className={cn("absolute inset-0", innerClassName)}
          style={wipeStyle}
        >
          {children}
        </div>
      </div>
    );
  }

  // Variant "rise" : opacité + léger translate (n'empêche pas l'observer).
  const riseStyle: CSSProperties = animate
    ? {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(1.5rem)",
        transition:
          "opacity 600ms ease-out, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
      }
    : {};

  return (
    <div ref={ref} className={cn(className)} style={riseStyle}>
      {children}
    </div>
  );
}
