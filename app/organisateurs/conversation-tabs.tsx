"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Archive,
  Flag,
  Inbox,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LIBELLES_ONGLETS,
  ONGLETS,
  normaliserOnglet,
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Onglets pilotés par l'URL (le filtrage se fait côté serveur, pas via des
  // TabsContent) : le composant Tabs est CONTRÔLÉ par `ongletActif` (lu depuis
  // ?onglet=) et chaque changement navigue en conservant les autres query
  // params — en particulier ?q= : basculer d'onglet ne doit pas effacer une
  // recherche en cours.
  function onOngletChange(valeur: string) {
    const onglet = normaliserOnglet(valeur);
    const params = new URLSearchParams(searchParams.toString());
    params.set("onglet", onglet);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs
      value={ongletActif}
      onValueChange={onOngletChange}
      aria-label="Filtrer les conversations"
    >
      {/* TabsList shadcn = segmented control sur UNE ligne (triggers en flex-1,
          largeurs égales). Sur mobile chaque onglet se réduit à icône +
          compteur ; le libellé apparaît à partir de sm. */}
      <TabsList>
        {ONGLETS.map((onglet) => {
          const Icone = ICONES[onglet];
          const libelle = LIBELLES_ONGLETS[onglet];
          const compteur = compteurs[onglet];

          return (
            <TabsTrigger
              key={onglet}
              value={onglet}
              title={`${libelle} (${compteur})`}
            >
              <Icone aria-hidden />

              {/* Libellé décoratif, visible seulement à partir de sm. */}
              <span aria-hidden className="hidden sm:inline">
                {libelle}
              </span>

              {/* Compteur décoratif, toujours visible (info utile même sur
                  mobile : combien de conversations dans chaque onglet). */}
              <span
                aria-hidden
                className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-foreground/10 px-1.5 text-xs font-semibold"
              >
                {compteur}
              </span>

              {/* Nom accessible complet, toujours présent même quand le libellé
                  est masqué visuellement (les spans visibles sont aria-hidden). */}
              <span className="sr-only">
                {libelle} ({compteur})
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
