// Relance automatique (FR-15, AD-7). Une Conversation prioritaire (Signal de
// danger, Story 2.2) non traitée depuis au moins 4h reçoit une seconde
// notification Telegram, identique à la première (notifierNouveauMessage,
// Story 3.4 — aucune modification de son texte).
//
// "Non traitée" reprend exactement la définition du Spine (section Lu/non-lu,
// partagée avec app/organisateurs/page.tsx via lib/conversation-lecture.ts,
// revue de code du 2026-07-16). relance_envoyee_at suit la même logique de
// comparaison (pas un simple booléen) pour qu'un nouveau message élève dans
// une Conversation déjà relancée redevienne éligible à une nouvelle relance
// après 4h, sans logique de reset explicite.
//
// Périmètre volontairement distinct de chargerConversations
// (app/organisateurs/page.tsx) côté requêtes/format de retour : ne récupère
// que les Conversations prioritaires, pas toutes, et ne produit aucun format
// d'affichage (NFR-1) — seul le calcul "dernier message élève" et le
// prédicat "non traitée" sont partagés (lib/conversation-lecture.ts).

import { supabaseServer } from "@/lib/supabase-server";
import { notifierNouveauMessage } from "@/lib/telegram";
import {
  calculerDernierMessageEleveParConversation,
  estNonTraitee,
} from "@/lib/conversation-lecture";

const QUATRE_HEURES_MS = 4 * 60 * 60 * 1000;

type ConversationPrioritaire = {
  id: string;
  last_organizer_read_at: string | null;
  relance_envoyee_at: string | null;
};

type MessageEleve = {
  conversation_id: string;
  created_at: string;
};

/**
 * Vérifie les Conversations prioritaires non traitées depuis au moins 4h et
 * envoie une relance Telegram (identique à la notification initiale) à
 * celles qui n'ont pas déjà été relancées pour leur dernier message élève.
 * Ne lève jamais d'exception — un échec (Supabase, Telegram) pour une
 * Conversation ne doit jamais empêcher le traitement des autres.
 */
export async function envoyerRelancesEnRetard(): Promise<{
  relancesEnvoyees: number;
}> {
  let conversations: ConversationPrioritaire[] = [];

  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, last_organizer_read_at, relance_envoyee_at")
      .eq("is_priority", true);

    if (error) {
      console.error(
        "Échec de la requête conversations prioritaires (relance) :",
        error.message
      );
      return { relancesEnvoyees: 0 };
    }

    conversations = data ?? [];
  } catch (error) {
    console.error(
      "Exception lors de la requête conversations prioritaires (relance) :",
      error
    );
    return { relancesEnvoyees: 0 };
  }

  if (conversations.length === 0) {
    return { relancesEnvoyees: 0 };
  }

  let messages: MessageEleve[] = [];

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
      console.error(
        "Échec de la requête messages élève (relance) :",
        error.message
      );
      return { relancesEnvoyees: 0 };
    }

    messages = data ?? [];
  } catch (error) {
    console.error(
      "Exception lors de la requête messages élève (relance) :",
      error
    );
    return { relancesEnvoyees: 0 };
  }

  const dernierMessageEleveParConversation =
    calculerDernierMessageEleveParConversation(messages);

  const maintenant = Date.now();

  const eligibles = conversations
    .map((conversation) => ({
      conversation,
      dernierMessageEleve:
        dernierMessageEleveParConversation.get(conversation.id) ?? null,
    }))
    .filter(({ conversation, dernierMessageEleve }) => {
      if (dernierMessageEleve === null) {
        return false;
      }

      const dernierMessageEleveMs = Date.parse(dernierMessageEleve);
      const pasEncoreRelancee =
        conversation.relance_envoyee_at === null ||
        Date.parse(conversation.relance_envoyee_at) < dernierMessageEleveMs;
      const depasseQuatreHeures =
        maintenant - dernierMessageEleveMs >= QUATRE_HEURES_MS;

      return (
        estNonTraitee(conversation.last_organizer_read_at, dernierMessageEleve) &&
        pasEncoreRelancee &&
        depasseQuatreHeures
      );
    });

  // Chaque Conversation est traitée indépendamment (Promise.allSettled, pas
  // Promise.all) : un échec isolé (Telegram, Supabase) ne doit jamais
  // empêcher la relance des autres Conversations éligibles.
  //
  // Réclamation atomique AVANT l'envoi (revue de code, 2026-07-16) :
  // l'update ci-dessous ne réussit à réclamer la ligne que si
  // relance_envoyee_at est encore null/périmé au moment précis de l'écriture
  // (clause .or() rejouant la même condition que pasEncoreRelancee) — deux
  // exécutions concurrentes du cron (Vercel documente que la livraison peut
  // occasionnellement invoquer deux fois la même exécution planifiée) ne
  // peuvent donc pas toutes les deux réclamer la même Conversation et
  // envoyer chacune une notification. Si l'envoi Telegram échoue ensuite
  // (notifierNouveauMessage retourne false — jamais d'exception), la
  // réclamation est explicitement annulée (remise à null) pour que la
  // Conversation reste éligible au prochain passage du cron plutôt que de
  // perdre silencieusement et définitivement la relance.
  const resultats = await Promise.allSettled(
    eligibles.map(async ({ conversation, dernierMessageEleve }) => {
      const { data: reclamee, error: erreurReclamation } = await supabaseServer
        .from("conversations")
        .update({ relance_envoyee_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .or(`relance_envoyee_at.is.null,relance_envoyee_at.lt.${dernierMessageEleve}`)
        .select("id");

      if (erreurReclamation) {
        throw erreurReclamation;
      }

      if (!reclamee || reclamee.length === 0) {
        // Déjà réclamée par une exécution concurrente entre notre lecture et
        // notre écriture : rien à envoyer ici, ce n'est pas un échec.
        return false;
      }

      const succes = await notifierNouveauMessage(conversation.id, true);

      if (!succes) {
        const { error: erreurAnnulation } = await supabaseServer
          .from("conversations")
          .update({ relance_envoyee_at: null })
          .eq("id", conversation.id);

        if (erreurAnnulation) {
          console.error(
            "Échec de l'annulation de la réclamation de relance après échec Telegram :",
            conversation.id,
            erreurAnnulation.message
          );
        }

        throw new Error("Échec de l'envoi Telegram pour la relance");
      }

      return true;
    })
  );

  let relancesEnvoyees = 0;

  resultats.forEach((resultat, index) => {
    if (resultat.status === "fulfilled") {
      if (resultat.value) {
        relancesEnvoyees += 1;
      }
    } else {
      console.error(
        "Échec de la relance pour une conversation :",
        eligibles[index].conversation.id,
        resultat.reason
      );
    }
  });

  return { relancesEnvoyees };
}
