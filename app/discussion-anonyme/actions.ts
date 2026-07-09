"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  SESSION_COOKIE_NAME,
  findConversationByRecoveryCode,
  hashSecret,
  isCodeAvailable,
  isRecoveryLocked,
  issueSessionToken,
  recordRecoveryAttempt,
  setSessionCookie,
  verifySecret,
} from "@/lib/session";
import { getAccuseReceptionAleatoire } from "@/lib/accuse-reception";

export type ChoisirModeSauvegarderState = {
  error: string | null;
};

export type EnvoyerMessageState = {
  error: string | null;
  accuse: string | null;
};

export type RecupererCodeState = {
  error: string | null;
};

const MESSAGE_MAX_LENGTH = 4000;
const ERREUR_GENERIQUE_ENVOI =
  "Impossible d'envoyer ce message. Réessaie dans quelques instants.";
const ERREUR_GENERIQUE_RECUPERATION =
  "Code invalide. Vérifie ta saisie et réessaie.";
const ERREUR_VERROUILLAGE_RECUPERATION =
  "Trop de tentatives depuis cet appareil. Réessaie dans 15 minutes.";

const CODE_REGEX = /^[a-zA-Z0-9]{6,20}$/;

// Server Action : vérifie/produit elle-même tout ce dont elle a besoin
// (validation, disponibilité), sans supposer qu'une validation a déjà eu
// lieu côté page (AD-3).
export async function choisirModeSauvegarder(
  _prevState: ChoisirModeSauvegarderState,
  formData: FormData
): Promise<ChoisirModeSauvegarderState> {
  const code = (formData.get("code")?.toString().trim() ?? "").toLowerCase();

  if (!CODE_REGEX.test(code)) {
    return {
      error:
        "Ton Code doit contenir entre 6 et 20 lettres et/ou chiffres, sans espace ni caractère spécial.",
    };
  }

  let disponible: boolean;
  try {
    disponible = await isCodeAvailable(code);
  } catch {
    return {
      error:
        "Une erreur est survenue pendant la création de ta conversation. Réessaie.",
    };
  }

  if (!disponible) {
    return {
      error: "Ce Code est déjà pris. Choisis-en un autre.",
    };
  }

  const [{ sessionToken, sessionTokenHash }, recoveryCodeHash] =
    await Promise.all([issueSessionToken(), hashSecret(code)]);

  const { data, error } = await supabaseServer
    .from("conversations")
    .insert({
      session_token_hash: sessionTokenHash,
      recovery_code_hash: recoveryCodeHash,
      is_ephemeral: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        "Une erreur est survenue pendant la création de ta conversation. Réessaie.",
    };
  }

  await setSessionCookie(sessionToken);

  redirect(`/discussion-anonyme?etape=pret&conv=${data.id}`);
}

// Mode éphémère : ni cookie, ni Code, ni session_token persistant (AD-5, FR-19).
export async function choisirModeEphemere(): Promise<void> {
  const { data, error } = await supabaseServer
    .from("conversations")
    .insert({
      session_token_hash: null,
      recovery_code_hash: null,
      is_ephemeral: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Impossible de créer la conversation éphémère :", error);
    redirect("/discussion-anonyme?erreur=ephemere");
  }

  redirect(`/discussion-anonyme?etape=pret&mode=ephemere&conv=${data.id}`);
}

// Envoi du premier message (et des suivants) — vérifie elle-même que le
// conversationId reçu correspond bien à une Conversation autorisée avant
// d'écrire quoi que ce soit (AD-3).
export async function envoyerMessage(
  conversationId: string,
  _prevState: EnvoyerMessageState,
  formData: FormData
): Promise<EnvoyerMessageState> {
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!message || message.length > MESSAGE_MAX_LENGTH) {
    return {
      error: "Écris un message avant d'envoyer (pas trop long non plus).",
      accuse: null,
    };
  }

  try {
    const { data: conversation, error: conversationError } = await supabaseServer
      .from("conversations")
      .select("id, is_ephemeral, session_token_hash")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversation) {
      console.error(
        "Échec de récupération de la conversation pour l'envoi :",
        conversationId,
        conversationError
      );
      return { error: ERREUR_GENERIQUE_ENVOI, accuse: null };
    }

    if (!conversation.is_ephemeral) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

      const autorise =
        !!sessionToken &&
        !!conversation.session_token_hash &&
        (await verifySecret(sessionToken, conversation.session_token_hash));

      if (!autorise) {
        return { error: ERREUR_GENERIQUE_ENVOI, accuse: null };
      }
    }

    const { error: insertError } = await supabaseServer.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "eleve",
      body: message,
    });

    if (insertError) {
      console.error(
        "Échec de l'insertion du message :",
        conversationId,
        insertError
      );
      return { error: ERREUR_GENERIQUE_ENVOI, accuse: null };
    }

    return { error: null, accuse: getAccuseReceptionAleatoire() };
  } catch (error) {
    console.error(
      "Erreur inattendue lors de l'envoi du message :",
      conversationId,
      error
    );
    return { error: ERREUR_GENERIQUE_ENVOI, accuse: null };
  }
}

// Récupération d'une conversation "Sauvegarder" via Code depuis un nouvel
// appareil (FR-18). Vérifie elle-même le format, le verrouillage
// anti-brute-force (AD-9) et l'existence d'une Conversation correspondante,
// avant de réémettre un session_token et de poser le cookie (AD-3, AD-5).
export async function recupererConversationParCode(
  _prevState: RecupererCodeState,
  formData: FormData
): Promise<RecupererCodeState> {
  const code = (formData.get("code")?.toString().trim() ?? "").toLowerCase();

  if (!CODE_REGEX.test(code)) {
    return { error: ERREUR_GENERIQUE_RECUPERATION };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const locked = await isRecoveryLocked(ip);
  if (locked) {
    return { error: ERREUR_VERROUILLAGE_RECUPERATION };
  }

  const conversation = await findConversationByRecoveryCode(code);

  // Journalisée après la réponse (after()) : le résultat n'est jamais lu par
  // l'appelant et ses erreurs sont déjà avalées en interne (voir docstring
  // de recordRecoveryAttempt) — inutile de faire attendre l'élève dessus.
  after(() => recordRecoveryAttempt(ip, code, conversation !== null));

  if (!conversation) {
    return { error: ERREUR_GENERIQUE_RECUPERATION };
  }

  const { sessionToken: nouveauSessionToken, sessionTokenHash: nouveauSessionTokenHash } =
    await issueSessionToken();

  const { error: updateError } = await supabaseServer
    .from("conversations")
    .update({ session_token_hash: nouveauSessionTokenHash })
    .eq("id", conversation.id);

  if (updateError) {
    console.error(
      "Échec de la réémission du session_token à la récupération :",
      conversation.id,
      updateError
    );
    return { error: ERREUR_GENERIQUE_RECUPERATION };
  }

  await setSessionCookie(nouveauSessionToken);

  redirect(`/discussion-anonyme?etape=pret&conv=${conversation.id}`);
}
