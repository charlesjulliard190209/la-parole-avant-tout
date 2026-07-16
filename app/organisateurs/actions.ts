"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  createSupabaseAuthServerClient,
  requireOrganisateur,
} from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";

export type SeConnecterState = {
  error: string | null;
};

const ERREUR_GENERIQUE_CONNEXION =
  "Email ou mot de passe incorrect. Réessaie.";

// Server Action : vérifie elle-même l'authentification via Supabase Auth
// (AD-3). Message d'erreur volontairement identique que l'email soit
// inconnu ou le mot de passe incorrect (AC #3) — ne jamais indiquer si un
// email existe, même principe que l'erreur de Code invalide (FR-18).
export async function seConnecter(
  _prevState: SeConnecterState,
  formData: FormData
): Promise<SeConnecterState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { error: ERREUR_GENERIQUE_CONNEXION };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Échec de connexion Organisateur :", error.message);
    return { error: ERREUR_GENERIQUE_CONNEXION };
  }

  redirect("/organisateurs");
}

// Vérifie elle-même l'authentification avant d'agir (AD-3), comme
// seConnecter ci-dessus — ne suppose jamais que le proxy (contrôle optimiste
// uniquement, voir proxy.ts) a déjà tout vérifié.
export async function seDeconnecter(): Promise<void> {
  await requireOrganisateur();

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Échec de déconnexion Organisateur :", error.message);
  }

  redirect("/organisateurs/connexion");
}

export type RepondreState = {
  error: string | null;
  success: boolean;
};

const MESSAGE_MAX_LENGTH = 4000;
const ERREUR_GENERIQUE_REPONSE =
  "Impossible d'envoyer cette réponse. Réessaie dans quelques instants.";

// Réponse d'un Organisateur à une Conversation (FR-6). Vérifie elle-même
// l'authentification (AD-3), comme seConnecter/seDeconnecter ci-dessus.
// Aucune vérification d'existence de conversationId au préalable : la
// contrainte foreign key de messages.conversation_id fait déjà échouer
// proprement un insert sur un id invalide (voir migration
// 20260708000000_conversations_and_messages.sql).
export async function repondre(
  conversationId: string,
  _prevState: RepondreState,
  formData: FormData
): Promise<RepondreState> {
  await requireOrganisateur();

  const rawMessage = formData.get("message");

  if (typeof rawMessage !== "string") {
    return { error: ERREUR_GENERIQUE_REPONSE, success: false };
  }

  const message = rawMessage.trim();

  if (!message || message.length > MESSAGE_MAX_LENGTH) {
    return {
      error: "Écris une réponse avant d'envoyer (pas trop longue non plus).",
      success: false,
    };
  }

  const { error } = await supabaseServer.from("messages").insert({
    conversation_id: conversationId,
    sender_type: "organisateur",
    body: message,
  });

  if (error) {
    console.error(
      "Échec de l'insertion de la réponse Organisateur :",
      conversationId,
      error.message
    );
    return { error: ERREUR_GENERIQUE_REPONSE, success: false };
  }

  // Le fil de messages de [conversationId]/page.tsx vient du rendu serveur
  // initial — sans revalidation, une réponse fraîchement envoyée resterait
  // invisible dans le fil tant que la page n'est pas rechargée manuellement
  // (revue de code, 2026-07-16).
  revalidatePath(`/organisateurs/${conversationId}`);

  return { error: null, success: true };
}

// "Marquer lu" (FR-6, FR-5) : appelée à l'ouverture d'une Conversation par un
// Organisateur — met à jour last_organizer_read_at, définition exacte
// réutilisée par la Story 3.2 (badge "Non traitée") et la Story 3.5 (relance
// à 4h). Vérifie elle-même l'authentification (AD-3), même si la page
// appelante l'a déjà fait. Écriture différée via after() (même motif que la
// mise à jour is_priority dans app/discussion-anonyme/actions.ts) : son échec
// ne doit jamais empêcher l'affichage du fil, et son résultat n'est jamais lu
// par l'appelant.
export async function marquerLu(conversationId: string): Promise<void> {
  await requireOrganisateur();

  after(async () => {
    const { error } = await supabaseServer
      .from("conversations")
      .update({ last_organizer_read_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) {
      console.error(
        "Échec de la mise à jour last_organizer_read_at (marquerLu) :",
        conversationId,
        error.message
      );
    }
  });
}
