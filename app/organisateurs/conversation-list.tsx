import Link from "next/link";

export type ConversationSummary = {
  id: string;
  isPriority: boolean;
  isEphemeral: boolean;
  createdAt: string;
  nonTraitee: boolean;
};

// Première convention de format de date du projet (Story 3.2) — fr-FR,
// cohérente avec le reste de l'interface. Fuseau explicite Europe/London
// (produit destiné à un lycée au Royaume-Uni) : sans lui, le rendu suivrait
// le fuseau du runtime serveur (Vercel, généralement UTC), pas celui des
// Organisateurs.
const formateurDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

export function ConversationList({
  conversations,
  erreur,
}: {
  conversations: ConversationSummary[];
  erreur: boolean;
}) {
  if (conversations.length === 0) {
    // Une liste vide par échec de la requête conversations est déjà
    // signalée par le bandeau d'erreur de la page — ne pas superposer
    // "Aucune conversation pour le moment", qui se lirait comme un état
    // normal plutôt que comme une absence de visibilité sur les Conversations.
    if (erreur) {
      return null;
    }

    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Aucune conversation pour le moment.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href={`/organisateurs/${conversation.id}`}
            className={`block rounded-xl border p-4 text-sm transition hover:opacity-80 ${
              conversation.isPriority
                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {conversation.isPriority && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Prioritaire
                </span>
              )}
              {conversation.nonTraitee && (
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
                  Non traitée
                </span>
              )}
              {conversation.isEphemeral && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Éphémère
                </span>
              )}
            </div>

            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              Conversation du {formateurDate.format(new Date(conversation.createdAt))}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
