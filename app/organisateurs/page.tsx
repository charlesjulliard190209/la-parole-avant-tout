import { Button } from "@/components/ui/button";
import { requireOrganisateur } from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";
import {
  calculerDernierMessageEleveParConversation,
  estNonTraitee,
} from "@/lib/conversation-lecture";
import {
  chargerArchivedAtParConversation,
  estArchivee,
} from "@/lib/conversation-archive";
import {
  extraireExtrait,
  normaliserOnglet,
  type OngletId,
} from "@/lib/conversation-admin";
import { seDeconnecter } from "./actions";
import {
  ConversationList,
  ConversationSearchResults,
  type ConversationSummary,
  type ResultatRecherche,
} from "./conversation-list";
import { ConversationTabs } from "./conversation-tabs";
import { SearchBar } from "./search-bar";

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

type MessageRechercheRow = {
  conversation_id: string;
  body: string;
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

  // archived_at est chargé en requête SÉPARÉE et best-effort (voir
  // lib/conversation-archive) : la requête principale ci-dessus ne le
  // sélectionne pas et ne peut donc pas casser si la migration n'est pas
  // encore appliquée. Si le helper renvoie null (colonne absente ou incident),
  // TOUTES les conversations sont traitées comme actives (onglet Archivées
  // vide) sans planter.
  const archivedParConversation = await chargerArchivedAtParConversation(
    conversations.map((conversation) => conversation.id)
  );

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

    const archived = archivedParConversation
      ? estArchivee(archivedParConversation.get(conversation.id))
      : false;

    return {
      id: conversation.id,
      isPriority: conversation.is_priority,
      isEphemeral: conversation.is_ephemeral,
      createdAt: conversation.created_at,
      nonTraitee,
      archived,
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

// Échappe les métacaractères de `ilike` (%, _, \) pour que le terme saisi soit
// recherché littéralement et non interprété comme un motif de recherche.
function echapperLike(terme: string): string {
  return terme.replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
}

type ChargementRecherche = {
  resultats: ResultatRecherche[];
  erreurRecherche: boolean;
};

// Recherche GLOBALE, insensible à la casse, sur le contenu des messages
// (messages.body), TOUTES conversations confondues (y compris archivées). On
// remonte un extrait par conversation, à partir du message correspondant le
// plus récent.
async function rechercherConversations(
  terme: string,
  metaParConversation: Map<string, ConversationSummary>
): Promise<ChargementRecherche> {
  let lignes: MessageRechercheRow[] = [];

  try {
    const { data, error } = await supabaseServer
      .from("messages")
      .select("conversation_id, body, created_at")
      .ilike("body", `%${echapperLike(terme)}%`)
      // Le plus récent d'abord : garantit qu'on garde le dernier message
      // correspondant par conversation, et ordonne les résultats par
      // fraîcheur (choix de tri le plus lisible pour une recherche).
      .order("created_at", { ascending: false })
      // Garde-fou volumétrie : une recherche très large ne doit pas ramener
      // des milliers de messages.
      .limit(200);

    if (error) {
      console.error("Échec de la requête recherche (liste Organisateurs) :", error.message);
      return { resultats: [], erreurRecherche: true };
    }

    lignes = data ?? [];
  } catch (error) {
    console.error("Exception lors de la requête recherche (liste Organisateurs) :", error);
    return { resultats: [], erreurRecherche: true };
  }

  const resultats: ResultatRecherche[] = [];
  const dejaVue = new Set<string>();

  for (const ligne of lignes) {
    // Les lignes sont triées par date décroissante : la première rencontrée
    // pour une conversation est donc son message correspondant le plus récent.
    if (dejaVue.has(ligne.conversation_id)) {
      continue;
    }
    dejaVue.add(ligne.conversation_id);

    // Métadonnées de la conversation (badges, date). Fallback si la
    // conversation n'a pas pu être chargée (incident sur la requête
    // conversations) : on penche vers PLUS de visibilité en affichant quand
    // même le résultat plutôt que de le masquer.
    const meta = metaParConversation.get(ligne.conversation_id) ?? {
      id: ligne.conversation_id,
      isPriority: false,
      isEphemeral: false,
      createdAt: ligne.created_at,
      nonTraitee: false,
      archived: false,
    };

    resultats.push({
      ...meta,
      extrait: extraireExtrait(ligne.body, terme),
    });
  }

  return { resultats, erreurRecherche: false };
}

// Filtre les conversations actives/archivées selon l'onglet demandé. "Non
// traitées" et "Prioritaires" sont des SOUS-ENSEMBLES de "En cours" (toutes
// les conversations actives) ; "Archivées" est l'état opposé (archived_at
// renseigné). Le tri interne de chaque onglet reste celui de
// chargerConversations().
function filtrerParOnglet(
  conversations: ConversationSummary[],
  onglet: OngletId
): ConversationSummary[] {
  switch (onglet) {
    case "non-traitees":
      return conversations.filter((c) => !c.archived && c.nonTraitee);
    case "prioritaires":
      return conversations.filter((c) => !c.archived && c.isPriority);
    case "en-cours":
      return conversations.filter((c) => !c.archived);
    case "archivees":
      return conversations.filter((c) => c.archived);
  }
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

  const ongletParam = Array.isArray(params.onglet)
    ? params.onglet[0]
    : params.onglet;
  const ongletActif = normaliserOnglet(ongletParam);

  const qParam = Array.isArray(params.q) ? params.q[0] : params.q;
  const terme = (qParam ?? "").trim();
  const rechercheActive = terme.length > 0;

  const { conversations, erreurConversations, erreurMessages } =
    await chargerConversations();

  // Compteurs par onglet, calculés côté serveur et passés aux onglets. Ils
  // restent affichés même pendant une recherche (contexte permanent).
  const compteurs: Record<OngletId, number> = {
    "non-traitees": conversations.filter((c) => !c.archived && c.nonTraitee)
      .length,
    prioritaires: conversations.filter((c) => !c.archived && c.isPriority)
      .length,
    "en-cours": conversations.filter((c) => !c.archived).length,
    archivees: conversations.filter((c) => c.archived).length,
  };

  const conversationsOnglet = filtrerParOnglet(conversations, ongletActif);

  // Recherche : uniquement quand ?q= est non vide. On indexe les métadonnées
  // déjà chargées par id pour éviter une seconde requête conversations.
  let resultatsRecherche: ResultatRecherche[] = [];
  let erreurRecherche = false;

  if (rechercheActive) {
    const metaParConversation = new Map(
      conversations.map((conversation) => [conversation.id, conversation])
    );
    const recherche = await rechercherConversations(terme, metaParConversation);
    resultatsRecherche = recherche.resultats;
    erreurRecherche = recherche.erreurRecherche;
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Espace Organisateurs
          </h1>

          <form action={seDeconnecter}>
            <Button type="submit" variant="outline" size="sm">
              Se déconnecter
            </Button>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          {erreurOuvertureConversation && (
            <p role="alert" className="text-sm font-medium text-destructive">
              Impossible d&apos;ouvrir cette conversation. Réessaie dans
              quelques instants.
            </p>
          )}
          {erreurConversations && (
            <p role="alert" className="text-sm font-medium text-destructive">
              Erreur de chargement des conversations. La liste ne peut pas
              s&apos;afficher pour l&apos;instant — réessaie dans quelques
              instants.
            </p>
          )}
          {!erreurConversations && erreurMessages && (
            <p role="alert" className="text-sm font-medium text-destructive">
              Erreur partielle de chargement. Les statuts &quot;non
              traitée&quot; affichés peuvent être imprécis — réessaie dans
              quelques instants.
            </p>
          )}

          {/* Barre de recherche EN HAUT, au-dessus des onglets. */}
          <SearchBar valeurInitiale={terme} />

          {/* Onglets toujours visibles (contexte + compteurs). Pendant une
              recherche, leur sélection n'a pas d'effet : la vue bascule sur les
              résultats de recherche. */}
          <ConversationTabs ongletActif={ongletActif} compteurs={compteurs} />

          {rechercheActive ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Résultats de recherche sur toutes les conversations (onglet
                ignoré).
              </p>

              {erreurRecherche && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  Erreur pendant la recherche. Réessaie dans quelques instants.
                </p>
              )}

              <ConversationSearchResults
                resultats={resultatsRecherche}
                terme={terme}
                erreur={erreurRecherche}
              />
            </div>
          ) : (
            <ConversationList
              conversations={conversationsOnglet}
              erreur={erreurConversations}
            />
          )}
        </div>
      </div>
    </main>
  );
}
