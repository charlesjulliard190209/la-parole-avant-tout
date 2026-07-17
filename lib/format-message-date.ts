// Horodatage d'un message de conversation, format court fr-FR. Fuseau explicite
// Europe/London (produit destiné à un lycée au Royaume-Uni) — sans lui, le
// rendu suivrait le fuseau du runtime serveur (Vercel, généralement UTC), pas
// celui des utilisateurs. Même convention que le formateur de date de la liste
// Organisateurs (conversation-list), factorisée ici car partagée entre les deux
// fils de discussion (élève et Organisateur).
const formateurHorodatage = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

export function formaterHorodatageMessage(isoString: string): string {
  return formateurHorodatage.format(new Date(isoString));
}
