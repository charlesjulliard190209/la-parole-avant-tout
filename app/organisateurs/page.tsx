import { requireOrganisateur } from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";
import {
  calculerDernierMessageEleveParConversation,
  estNonTraitee,
} from "@/lib/conversation-lecture";
import { seDeconnecter } from "./actions";
import { ConversationList, type ConversationSummary } from "./conversation-list";

export const metadata = {
  title: "Organisateurs — La Parole Avant Tout",
};

type ConversationRow = {
  id: string;
  is_priority: boolean;
  is_ephemeral: boolean;
  last_organizer_read_at: string | null;
  created_at: string;
};

type MessageRow = {
  conversation_id: string;
  created_at: string;
};

type ChargementConversations = {
  conversations: ConversationSummary[];
  erreurConversations: boolean;
  erreurMessages: boolean;
};

// "Non traitée" (FR-5, FR-15) : last_organizer_read_at est null OU antérieur
// au dernier message de type "eleve" — définition fixée par l'Architecture
// Spine (section "Lu/non-lu"), réutilisée telle quelle par la Story 3.5.
async function chargerConversations(): Promise<ChargementConversations> {
  let conversations: ConversationRow[] = [];
  let erreurConversations = false;

  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, is_priority, is_ephemeral, last_organizer_read_at, created_at");

    if (error) {
      console.error("Échec de la requête conversations (liste Organisateurs) :", error.message);
      erreurConversations = true;
    }

    conversations = data ?? [];
  } catch (error) {
    console.error("Exception lors de la requête conversations (liste Organisateurs) :", error);
    erreurConversations = true;
  }

  // Une erreur ici ne doit jamais se confondre avec un vrai "aucune
  // conversation" (AC #6) — le flag erreur est remonté à la page pour
  // afficher un message distinct plutôt qu'un silencieux "rien à faire".
  if (erreurConversations || conversations.length === 0) {
    return {
      conversations: [],
      erreurConversations,
      erreurMessages: false,
    };
  }

  let messages: MessageRow[] = [];
  let erreurMessages = false;

  try {
    const { data, error } = await supabaseServer
      .from("messages")
      .select("conversation_id, created_at")
      .eq("sender_type", "eleve")
      .in(
        "conversation_id",
        conversations.map((conversation) => conversation.id)
      );

    if (error) {
      console.error("Échec de la requête messages (liste Organisateurs) :", error.message);
      erreurMessages = true;
    }

    messages = data ?? [];
  } catch (error) {
    console.error("Exception lors de la requête messages (liste Organisateurs) :", error);
    erreurMessages = true;
  }

  const dernierMessageEleveParConversation =
    calculerDernierMessageEleveParConversation(messages);

  const resume: ConversationSummary[] = conversations.map((conversation) => {
    const dernierMessageEleve =
      dernierMessageEleveParConversation.get(conversation.id) ?? null;

    // Fail-safe : si la requête messages a échoué, on ne peut pas savoir
    // quelles Conversations ont un message élève non lu — on les considère
    // toutes comme "non traitées" plutôt que de risquer de cacher
    // silencieusement un Signal de danger derrière un incident Supabase.
    const nonTraitee =
      erreurMessages ||
      estNonTraitee(conversation.last_organizer_read_at, dernierMessageEleve);

    return {
      id: conversation.id,
      isPriority: conversation.is_priority,
      isEphemeral: conversation.is_ephemeral,
      createdAt: conversation.created_at,
      nonTraitee,
    };
  });

  // Ordre confirmé par Charles (2026-07-15) : prioritaires en tête, puis non
  // traitées, puis les plus récentes ; départage final par id si tout le
  // reste est identique (garantit un ordre stable et déterministe).
  const trie = resume.sort((a, b) => {
    if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }

    if (a.nonTraitee !== b.nonTraitee) {
      return a.nonTraitee ? -1 : 1;
    }

    const diffDate = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    return diffDate !== 0 ? diffDate : a.id.localeCompare(b.id);
  });

  return {
    conversations: trie,
    erreurConversations: false,
    erreurMessages,
  };
}

// requireOrganisateur() est le contrôle authoritatif (getUser(), revalidé
// auprès de Supabase) — cette page ne suppose jamais qu'une vérification a
// déjà eu lieu ailleurs (AD-3). proxy.ts fait un contrôle optimiste (JWT
// local) en amont sur cette route.
export default async function OrganisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireOrganisateur();

  const params = await searchParams;
  const erreurParam = Array.isArray(params.erreur)
    ? params.erreur[0]
    : params.erreur;
  // Généré par app/organisateurs/[conversationId]/page.tsx quand
  // l'ouverture d'une Conversation échoue (id invalide ou incident
  // Supabase, indistinguables volontairement — AC #6). Ne dit jamais
  // laquelle des deux causes s'est produite (revue de code, 2026-07-16).
  const erreurOuvertureConversation = erreurParam === "conversation";

  const { conversations, erreurConversations, erreurMessages } =
    await chargerConversations();

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Espace Organisateurs
          </h1>

          <form action={seDeconnecter}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:text-zinc-50"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="mt-6">
          {erreurOuvertureConversation && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-600 dark:text-red-400"
            >
              Impossible d&apos;ouvrir cette conversation. Réessaie dans
              quelques instants.
            </p>
          )}
          {erreurConversations && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-600 dark:text-red-400"
            >
              Erreur de chargement des conversations. La liste ne peut pas
              s&apos;afficher pour l&apos;instant — réessaie dans quelques
              instants.
            </p>
          )}
          {!erreurConversations && erreurMessages && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-600 dark:text-red-400"
            >
              Erreur partielle de chargement. Les statuts &quot;non
              traitée&quot; affichés peuvent être imprécis — réessaie dans
              quelques instants.
            </p>
          )}
          <ConversationList
            conversations={conversations}
            erreur={erreurConversations}
          />
        </div>
      </div>
    </main>
  );
}
