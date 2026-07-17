// Helpers PURS (sans I/O) de la page liste Organisateurs : identité des
// onglets et extraction d'un extrait de recherche. Isolés ici pour être
// partagés entre le Server Component (page.tsx) et le composant client
// (conversation-tabs.tsx) sans dupliquer — ni risquer de faire diverger — la
// logique de normalisation de l'onglet.

export type OngletId = "non-traitees" | "prioritaires" | "en-cours" | "archivees";

// Ordre d'affichage des onglets, du plus « actionnable » au moins urgent.
export const ONGLETS: readonly OngletId[] = [
  "non-traitees",
  "prioritaires",
  "en-cours",
  "archivees",
] as const;

// Libellés EXACTS attendus dans l'UI (référencés par la spec).
export const LIBELLES_ONGLETS: Record<OngletId, string> = {
  "non-traitees": "Non traitées",
  prioritaires: "Prioritaires",
  "en-cours": "En cours",
  archivees: "Archivées",
};

// Onglet par défaut : « Non traitées », l'onglet le plus prioritaire. En cas
// de query param absent ou malformé, on retombe donc vers PLUS de visibilité
// (philosophie fail-safe du projet) plutôt que sur une vue neutre.
const ONGLET_PAR_DEFAUT: OngletId = "non-traitees";

// Normalise la valeur brute du query param ?onglet= : toute valeur absente ou
// inconnue retombe sur l'onglet par défaut.
export function normaliserOnglet(valeur: string | null | undefined): OngletId {
  if (valeur != null && (ONGLETS as readonly string[]).includes(valeur)) {
    return valeur as OngletId;
  }

  return ONGLET_PAR_DEFAUT;
}

// Longueur cible d'un extrait de résultat de recherche (~120 caractères
// autour du terme trouvé).
const LONGUEUR_EXTRAIT = 120;

// Construit un court extrait centré sur la première occurrence de `terme`
// dans `body`, insensible à la casse. La casse et le texte d'origine sont
// PRÉSERVÉS dans l'extrait rendu : seule la recherche de position ignore la
// casse (comme le `ilike` côté Supabase). Des points de suspension marquent
// une troncature en début et/ou fin d'extrait.
export function extraireExtrait(
  body: string,
  terme: string,
  longueur = LONGUEUR_EXTRAIT
): string {
  // Normalise les espaces (retours à la ligne, tabulations) pour un extrait
  // affichable sur une ou deux lignes sans casser la mise en page.
  const texte = body.replace(/\s+/g, " ").trim();

  const tronquerDebut = () =>
    texte.length > longueur ? texte.slice(0, longueur).trimEnd() + "…" : texte;

  if (terme.length === 0) {
    return tronquerDebut();
  }

  const position = texte.toLowerCase().indexOf(terme.toLowerCase());
  if (position === -1) {
    // Le terme n'apparaît pas dans CE message (ex : match survenu sur un
    // autre message de la conversation) : on retombe sur un extrait du début.
    return tronquerDebut();
  }

  // Marge de contexte de part et d'autre du terme trouvé.
  const marge = Math.max(0, Math.floor((longueur - terme.length) / 2));
  const debut = Math.max(0, position - marge);
  const fin = Math.min(texte.length, position + terme.length + marge);

  const extrait = texte.slice(debut, fin).trim();
  return (debut > 0 ? "…" : "") + extrait + (fin < texte.length ? "…" : "");
}
