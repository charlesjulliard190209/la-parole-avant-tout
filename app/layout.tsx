import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

// Corps de texte : police humaniste chaleureuse et très lisible (direction « Doux & rassurant »)
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

// Titres : police d'accent plus ronde et amicale (utilisable via l'utilitaire `font-heading`)
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
    <html
      lang="fr"
      className={`${nunitoSans.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
