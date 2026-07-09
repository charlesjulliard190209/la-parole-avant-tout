// Accusé de réception : texte pré-écrit, pas d'appel à un service d'IA
// externe (AD-11). Résout l'hypothèse [ASSUMPTION] du PRD (§4.2, FR-3) dans
// le sens tranché par l'Architecture.
export const ACCUSES_RECEPTION: string[] = [
  "Bien reçu. On te répond dès qu'on peut, on est aussi au lycée toute la journée.",
  "C'est bien arrivé. On te lit et on te répond dans la journée, promis.",
  "Ton message est bien parti. On est deux à le lire, réponse dès que possible.",
  "Reçu 5/5. On revient vers toi dès qu'on a un moment, souvent le jour même.",
];

export function getAccuseReceptionAleatoire(): string {
  const index = Math.floor(Math.random() * ACCUSES_RECEPTION.length);
  return ACCUSES_RECEPTION[index];
}
