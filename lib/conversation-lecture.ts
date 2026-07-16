// Définition canonique "Lu/non-lu" (FR-5, FR-15 — Architecture Spine, section
// "Lu/non-lu") : partagée entre app/organisateurs/page.tsx (badge "Non
// traitée") et lib/relance.ts (éligibilité à la relance) pour qu'une future
// évolution de cette règle ne puisse pas diverger silencieusement entre les
// deux usages — c'est la règle qui décide si un Signal de danger non lu
// déclenche une relance, donc une divergence non détectée serait un risque
// de sécurité, pas seulement un bug d'affichage (revue de code, 2026-07-16).

export function calculerDernierMessageEleveParConversation(
  messages: { conversation_id: string; created_at: string }[]
): Map<string, string> {
  const dernierMessageEleveParConversation = new Map<string, string>();

  for (const message of messages) {
    const dernier = dernierMessageEleveParConversation.get(
      message.conversation_id
    );

    if (!dernier || Date.parse(message.created_at) > Date.parse(dernier)) {
      dernierMessageEleveParConversation.set(
        message.conversation_id,
        message.created_at
      );
    }
  }

  return dernierMessageEleveParConversation;
}

export function estNonTraitee(
  lastOrganizerReadAt: string | null,
  dernierMessageEleve: string | null
): boolean {
  if (dernierMessageEleve === null) {
    return false;
  }

  return (
    lastOrganizerReadAt === null ||
    Date.parse(lastOrganizerReadAt) < Date.parse(dernierMessageEleve)
  );
}
