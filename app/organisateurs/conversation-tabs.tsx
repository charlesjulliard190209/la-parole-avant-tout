"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Archive,
  Flag,
  Inbox,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import {
  LIBELLES_ONGLETS,
  ONGLETS,
  type OngletId,
} from "@/lib/conversation-admin";

// Icône associée à chaque onglet (imposée par la spec).
const ICONES: Record<OngletId, LucideIcon> = {
  "non-traitees": Inbox,
  prioritaires: Flag,
  "en-cours": MessagesSquare,
  archivees: Archive,
};

export function ConversationTabs({
  ongletActif,
  compteurs,
}: {
  ongletActif: OngletId;
  compteurs: Record<OngletId, number>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construit l'URL d'un onglet en CONSERVANT les autres query params présents
  // (en particulier ?q= : basculer d'onglet ne doit jamais effacer une
  // recherche en cours).
  function hrefOnglet(onglet: OngletId): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("onglet", onglet);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav aria-label="Filtrer les conversations">
      {/* Pattern « pills qui se déplient » : sous sm, seul l'onglet actif
          affiche icône + libellé + compteur ; les onglets inactifs se
          réduisent à leur icône (avec un point si compteur > 0). À partir de
          sm, les 4 onglets sont dépliés. */}
      <ul className="flex flex-wrap gap-2">
        {ONGLETS.map((onglet) => {
          const Icone = ICONES[onglet];
          const actif = onglet === ongletActif;
          const libelle = LIBELLES_ONGLETS[onglet];
          const compteur = compteurs[onglet];

          return (
            <li key={onglet}>
              <Link
                href={hrefOnglet(onglet)}
                aria-current={actif ? "page" : undefined}
                className={`relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  actif
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icone aria-hidden className="h-4 w-4 shrink-0" />

                {/* Libellé visible (décoratif) : toujours pour l'onglet actif,
                    seulement à partir de sm pour les onglets inactifs. */}
                <span aria-hidden className={actif ? undefined : "hidden sm:inline"}>
                  {libelle}
                </span>

                {/* Compteur visible (décoratif), mêmes règles d'affichage que
                    le libellé. */}
                <span
                  aria-hidden
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    actif
                      ? "bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  } ${actif ? "" : "hidden sm:inline-flex"}`}
                >
                  {compteur}
                </span>

                {/* Point indicateur mobile : onglet inactif réduit à son icône
                    mais avec au moins un élément — signale visuellement qu'il
                    contient des conversations sans dérouler le compteur. */}
                {!actif && compteur > 0 && (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 sm:hidden"
                  />
                )}

                {/* Nom accessible complet, toujours présent dans l'arbre
                    d'accessibilité même quand le texte est masqué visuellement
                    (les spans visibles sont aria-hidden). */}
                <span className="sr-only">
                  {libelle} ({compteur})
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
