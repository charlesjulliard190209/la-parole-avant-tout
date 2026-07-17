import { supabaseServer } from "./supabase-server";

// Une conversation est archivée dès que archived_at est renseigné.
export function estArchivee(archivedAt: string | null | undefined): boolean {
  return archivedAt != null;
}

/**
 * Charge archived_at pour un lot de conversations, en requête SÉPARÉE et
 * best-effort : la requête principale de la page liste ne sélectionne donc
 * jamais archived_at et ne peut pas casser si la migration 20260717000000
 * n'est pas encore appliquée (même philosophie que last_student_read_at,
 * 2026-07-17).
 *
 * Retourne :
 * - une Map id → archived_at (null pour une conversation active) si la colonne
 *   existe ;
 * - `null` si la colonne est absente (migration non appliquée) ou en cas
 *   d'incident : l'appelant traite alors toutes les conversations comme
 *   actives (onglet « Archivées » vide), sans planter.
 */
export async function chargerArchivedAtParConversation(
  ids: string[]
): Promise<Map<string, string | null> | null> {
  if (ids.length === 0) {
    return new Map();
  }

  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, archived_at")
      .in("id", ids);

    if (error || !data) {
      // 42703 (colonne inconnue) comme tout autre incident : on renonce
      // silencieusement à la dimension archivage plutôt que de casser la liste.
      return null;
    }

    return new Map(
      data.map((row) => [row.id, row.archived_at as string | null])
    );
  } catch {
    return null;
  }
}
