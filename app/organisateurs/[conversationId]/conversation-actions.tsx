"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore, Flag, FlagOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  basculerArchivage,
  basculerPriorite,
  type GestionConversationState,
} from "../actions";

const initialState: GestionConversationState = { error: null };

// Barre d'actions de gestion d'une Conversation (priorité, archivage), placée
// dans l'en-tête sous les badges. Chaque action est un <form> distinct piloté
// par useActionState : l'action serveur est bindée avec conversationId (même
// convention que ReplyForm), et l'état CIBLE transite par un champ caché lu
// côté serveur — is_priority réel et is_archived réel sont recalculés au rendu
// serveur après le revalidatePath des actions, donc pas d'état local à gérer.
export function ConversationActions({
  conversationId,
  isPriority,
  isArchived,
}: {
  conversationId: string;
  isPriority: boolean;
  isArchived: boolean;
}) {
  const [prioriteState, prioriteAction, prioritePending] = useActionState(
    basculerPriorite.bind(null, conversationId),
    initialState
  );
  const [archivageState, archivageAction, archivagePending] = useActionState(
    basculerArchivage.bind(null, conversationId),
    initialState
  );

  // Un seul emplacement d'erreur : une seule action s'exécute à la fois, et
  // afficher deux bandeaux distincts serait du bruit inutile.
  const erreur = prioriteState.error ?? archivageState.error;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <form action={prioriteAction}>
          {/* Champ caché = état CIBLE : l'inverse de l'état courant. */}
          <input
            type="hidden"
            name="prioritaire"
            value={isPriority ? "false" : "true"}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={prioritePending}
            aria-label={
              isPriority
                ? "Retirer la priorité de cette conversation"
                : "Marquer cette conversation comme prioritaire"
            }
          >
            {isPriority ? <FlagOff /> : <Flag />}
            {prioritePending
              ? "…"
              : isPriority
                ? "Retirer la priorité"
                : "Prioriser"}
          </Button>
        </form>

        <form action={archivageAction}>
          {/* Idem : "true" pour archiver, "false" pour désarchiver. */}
          <input
            type="hidden"
            name="archiver"
            value={isArchived ? "false" : "true"}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={archivagePending}
            aria-label={
              isArchived
                ? "Désarchiver cette conversation"
                : "Archiver cette conversation"
            }
          >
            {isArchived ? <ArchiveRestore /> : <Archive />}
            {archivagePending ? "…" : isArchived ? "Désarchiver" : "Archiver"}
          </Button>
        </form>
      </div>

      {erreur && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {erreur}
        </p>
      )}
    </div>
  );
}
