"use server";

import { revalidatePath } from "next/cache";
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
import { containsDangerSignal } from "@/lib/danger-keywords";
import { notifierNouveauMessage } from "@/lib/telegram";

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

  // Détection (FR-9) : fonction pure, sans I/O — calculée avant tout appel
  // Supabase pour satisfaire "détecté avant l'écriture en base" (AC #1).
  // Le résultat n'est jamais renvoyé à l'Élève (AC #2, #7) : il ne sert qu'à
  // marquer la Conversation prioritaire plus bas (FR-10).
  const signalDanger = containsDangerSignal(message);

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

    // FR-10 : marquage silencieux en base uniquement — jamais l'inverse
    // (ne jamais écrire is_priority: false, cf. AC #4) pour ne pas effacer
    // une priorisation antérieure légitime d'un message précédent. L'envoi
    // de l'alerte Telegram elle-même reste hors périmètre (Epic 3). Différée
    // via after() (même motif que recordRecoveryAttempt ci-dessous) : cette
    // écriture n'est jamais lue par l'appelant et son échec est déjà avalé
    // en interne — inutile de faire attendre l'Élève sur ce round-trip
    // Supabase supplémentaire, surtout pour le message qui en a le plus
    // besoin (revue de code Story 2.2).
    if (signalDanger) {
      after(async () => {
        const { error: priorityError } = await supabaseServer
          .from("conversations")
          .update({ is_priority: true })
          .eq("id", conversationId);

        if (priorityError) {
          // Ne bloque jamais l'Élève (NFR-2) : le message est déjà bien
          // envoyé. Le filet humain (lecture par les Organisateurs) et le
          // signalement a posteriori (flagged_missed_danger, Epic 3) restent
          // le filet de secours en cas d'échec de cette écriture.
          console.error(
            "Échec de la mise à jour is_priority (Signal de danger) :",
            conversationId,
            priorityError
          );
        }
      });
    }

    // FR-7/FR-10 (Story 3.4) : notification Telegram différée via after(),
    // inconditionnelle (pas seulement sur signalDanger) — un seul mécanisme
    // notifie toujours les deux Organisateurs, prioritaire ou non (AD-7,
    // jamais deux chemins de code séparés "normal"/"urgence"). Réutilise
    // signalDanger déjà calculé plus haut plutôt que de requêter is_priority
    // à nouveau, pour éviter toute course avec l'after() ci-dessus.
    after(() => notifierNouveauMessage(conversationId, signalDanger));

    // Sans cette revalidation, le message envoyé ne s'affiche dans le fil
    // qu'après un rechargement manuel : la page (Server Component) garde son
    // rendu précédent alors que la base a bien reçu le message.
    revalidatePath("/discussion-anonyme");

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
