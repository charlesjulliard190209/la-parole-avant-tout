"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Délai avant de propager la saisie dans l'URL : évite une navigation (et une
// requête serveur) à chaque frappe.
const DELAI_DEBOUNCE_MS = 300;

export function SearchBar({ valeurInitiale }: { valeurInitiale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Input CONTRÔLÉ : l'état local suit la frappe immédiatement, l'URL est
  // mise à jour après un court debounce.
  const [valeur, setValeur] = useState(valeurInitiale);

  // Resynchronise le champ si l'URL change EN DEHORS de la saisie (navigation
  // arrière, lien externe). Pattern « ajuster l'état pendant le rendu »
  // recommandé par React plutôt qu'un useEffect de synchronisation.
  const [ancienneValeurInitiale, setAncienneValeurInitiale] =
    useState(valeurInitiale);
  if (valeurInitiale !== ancienneValeurInitiale) {
    setAncienneValeurInitiale(valeurInitiale);
    setValeur(valeurInitiale);
  }

  // Met à jour ?q= en conservant les autres query params (notamment ?onglet=).
  function pousserRecherche(terme: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nettoye = terme.trim();

    if (nettoye.length > 0) {
      params.set("q", nettoye);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname);
  }

  // Réf de timer pour le debounce ; on garde la dernière valeur voulue.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(prochaineValeur: string) {
    setValeur(prochaineValeur);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      pousserRecherche(prochaineValeur);
    }, DELAI_DEBOUNCE_MS);
  }

  function effacer() {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    setValeur("");
    pousserRecherche("");
  }

  // Nettoyage du timer au démontage.
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        // Entrée : propage immédiatement sans attendre le debounce.
        event.preventDefault();
        if (timer.current) {
          clearTimeout(timer.current);
        }
        pousserRecherche(valeur);
      }}
      className="relative"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
      />

      <input
        type="search"
        value={valeur}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher dans les messages…"
        aria-label="Rechercher dans les messages des conversations"
        className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:hidden"
      />

      {valeur.length > 0 && (
        <button
          type="button"
          onClick={effacer}
          aria-label="Effacer la recherche"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
