import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Body text: warm, highly readable humanist typeface
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

// Headings: rounder, friendlier accent typeface (available via the `font-heading` utility)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Parole Avant Tout",
  description: "Le site du Lycée Français Charles de Gaulle de Londres contre le harcèlement et l'exclusion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes sets the `dark` class on <html>
    // before hydration (inline anti-flash script) — the mismatch is expected.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${nunitoSans.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* defaultTheme="system": without an explicit choice from the
            student, follow the OS preference as before (Story 4.0, AC #5). */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
