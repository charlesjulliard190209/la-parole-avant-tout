// Détection de Signal de danger par correspondance simple de mots-clés —
// pas de modèle d'IA de compréhension du langage (Non-Goal PRD §5, AD-6).
// Liste hypothèse de départ, non validée cliniquement : à réviser avec
// Charles avant tout lancement public (même traitement que la liste de
// numéros d'urgence de l'ex-Story 2.1, livrée non bloquée puis retirée sur
// décision produit ultérieure — voir Dev Notes de la Story 2.2).
export const DANGER_KEYWORDS: string[] = [
  "suicide",
  "me tuer",
  "en finir",
  "plus envie de vivre",
  "envie de mourir",
  "je veux mourir",
  "disparaître à jamais",
  "me faire du mal",
  "me scarifier",
  "scarification",
  "automutilation",
];

// Retire les accents (décomposition NFD + suppression des marques
// diacritiques ̀-ͯ) avant comparaison : un message accentué
// saisi/encodé différemment du mot-clé stocké (accent manquant, forme
// Unicode décomposée selon le clavier/navigateur) doit quand même matcher —
// revue de code Story 2.2, sinon un vrai Signal de danger accentué pourrait
// passer inaperçu.
function normaliserAccents(texte: string): string {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function containsDangerSignal(message: string): boolean {
  const normalise = normaliserAccents(message.toLowerCase());
  return DANGER_KEYWORDS.some((motCle) =>
    normalise.includes(normaliserAccents(motCle.toLowerCase()))
  );
}
