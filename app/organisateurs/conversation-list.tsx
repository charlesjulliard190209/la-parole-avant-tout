import { SearchX, ThumbsUp, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ConversationSummary = {
  id: string;
  isPriority: boolean;
  isEphemeral: boolean;
  createdAt: string;
  nonTraitee: boolean;
  // Une conversation est SOIT active SOIT archivée (archived_at renseigné).
  // Calculé best-effort côté page : si la colonne archived_at n'existe pas
  // encore (migration non appliquée), toutes les conversations sont actives.
  archived: boolean;
};

// Un résultat de recherche = une conversation dont au moins un message matche,
// accompagnée d'un court extrait du message concerné.
export type ResultatRecherche = ConversationSummary & {
  extrait: string;
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

// Rangée de badges partagée entre la liste et les résultats de recherche.
// « Non traitée » est masqué pour une conversation archivée : archivé et non
// traité sont deux états mutuellement exclusifs dans le modèle (une
// conversation archivée n'est plus « à traiter »), afficher les deux serait
// contradictoire.
function BadgesConversation({
  conversation,
}: {
  conversation: ConversationSummary;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {conversation.isPriority && (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
          Prioritaire
        </span>
      )}
      {!conversation.archived && conversation.nonTraitee && (
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
          Non traitée
        </span>
      )}
      {conversation.archived && (
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          Archivée
        </span>
      )}
      {conversation.isEphemeral && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Éphémère
        </span>
      )}
    </div>
  );
}

// État vide centré (icône + message), occupant toute la hauteur disponible de
// la zone scrollable (flex-1) pour se retrouver au milieu du conteneur plein
// écran plutôt que collé en haut.
function EmptyState({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center text-zinc-500 dark:text-zinc-400">
      <Icon aria-hidden className="h-10 w-10 opacity-40" />
      <p className="text-sm">{children}</p>
    </div>
  );
}

// Style de carte-lien réutilisé par la liste et par les résultats de
// recherche (bordure rouge pour les prioritaires).
function classesCarte(isPriority: boolean): string {
  return `block rounded-xl border p-4 text-sm transition hover:opacity-80 ${
    isPriority
      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
  }`;
}

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
      <EmptyState icon={ThumbsUp}>Aucune conversation dans cet onglet.</EmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href={`/organisateurs/${conversation.id}`}
            className={classesCarte(conversation.isPriority)}
          >
            <BadgesConversation conversation={conversation} />

            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              Conversation du {formateurDate.format(new Date(conversation.createdAt))}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ConversationSearchResults({
  resultats,
  terme,
  erreur,
}: {
  resultats: ResultatRecherche[];
  terme: string;
  erreur: boolean;
}) {
  // En cas d'incident de la requête de recherche, le bandeau d'erreur de la
  // page suffit : ne pas afficher « aucun résultat » par-dessus, qui se
  // lirait à tort comme une recherche aboutie mais vide.
  if (erreur) {
    return null;
  }

  if (resultats.length === 0) {
    return (
      <EmptyState icon={SearchX}>
        Aucun message ne correspond à «&nbsp;{terme}&nbsp;».
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {resultats.length}{" "}
        {resultats.length > 1 ? "conversations trouvées" : "conversation trouvée"}
      </p>

      <ul className="space-y-3">
        {resultats.map((resultat) => (
          <li key={resultat.id}>
            <Link
              href={`/organisateurs/${resultat.id}`}
              className={classesCarte(resultat.isPriority)}
            >
              <BadgesConversation conversation={resultat} />

              {/* Extrait du message correspondant (le style italique + guillemets
                  le distingue du libellé de date d'une carte normale). */}
              <p className="mt-2 italic text-zinc-600 dark:text-zinc-400">
                «&nbsp;{resultat.extrait}&nbsp;»
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Conversation du {formateurDate.format(new Date(resultat.createdAt))}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
