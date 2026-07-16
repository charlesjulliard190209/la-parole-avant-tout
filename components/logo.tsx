/*
  « Aube » logo — SVG reinterpretation of the original logo.png
  (two interlocked speech bubbles + wordmark), validated 2026-07-16.

  Colors come from the semantic tokens, so the logo adapts to light
  (« Aube ») and dark (« Brun de nuit ») automatically:
  - back bubble: secondary-foreground (ardoise bleue / bleu ciel in dark)
  - front bubble: ring (pêche profonde / pêche lumineuse in dark)
  - wordmark: foreground (encre brune / ivoire doux in dark)

  The two bubbles mirror the chat signature: blue = the team, peach = the
  student. Standalone fixed-color files: public/logo-aube.svg and
  public/favicon-aube.svg (favicon also installed as app/icon.svg).
*/

import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 260 240"
      role="img"
      aria-label="La Parole Avant Tout — logo"
      {...props}
    >
      {/* Back bubble — the team, calm blue */}
      <circle
        cx="100"
        cy="103"
        r="68"
        fill="none"
        strokeWidth="15"
        className="stroke-secondary-foreground"
      />
      <path d="M58 148 L34 200 L92 166 Z" className="fill-secondary-foreground" />
      {/* Front bubble — the student, warm peach */}
      <circle
        cx="142"
        cy="115"
        r="79"
        fill="none"
        strokeWidth="15"
        className="stroke-ring"
      />
      <path d="M124 188 L150 238 L168 184 Z" className="fill-ring" />
    </svg>
  );
}

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 980 240"
      role="img"
      aria-label="La Parole Avant Tout"
      {...props}
    >
      <g transform="scale(0.92)">
        <circle
          cx="100"
          cy="103"
          r="68"
          fill="none"
          strokeWidth="15"
          className="stroke-secondary-foreground"
        />
        <path
          d="M58 148 L34 200 L92 166 Z"
          className="fill-secondary-foreground"
        />
        <circle
          cx="142"
          cy="115"
          r="79"
          fill="none"
          strokeWidth="15"
          className="stroke-ring"
        />
        <path d="M124 188 L150 238 L168 184 Z" className="fill-ring" />
      </g>
      <text
        x="268"
        y="106"
        fontSize="86"
        fontWeight="800"
        style={{ fontFamily: "var(--font-heading)" }}
        className="fill-foreground"
      >
        La Parole
      </text>
      <text
        x="268"
        y="198"
        fontSize="86"
        fontWeight="800"
        style={{ fontFamily: "var(--font-heading)" }}
        className="fill-foreground"
      >
        Avant Tout
      </text>
    </svg>
  );
}

/*
  Favicon artwork: two SOLID bubbles (outlined rings turn to noise at
  16px). Fixed colors on purpose — a favicon does not follow the page
  theme. Same artwork as app/icon.svg.
*/
export function Favicon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Favicon La Parole Avant Tout"
      {...props}
    >
      <g fill="#1F4E6B">
        <circle cx="24" cy="23" r="16" />
        <path d="M14 34 L8 48 L24 38 Z" />
      </g>
      <g fill="#E1793B">
        <circle cx="40" cy="36" r="19" />
        <path d="M34 52 L40 63 L46 51 Z" />
      </g>
    </svg>
  );
}
