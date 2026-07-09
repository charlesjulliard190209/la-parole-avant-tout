import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { choisirModeEphemere } from "./actions";
import { ConversationThread, type Message } from "./conversation-thread";
import { MessageForm } from "./message-form";
import { ModeChoiceSauvegarder } from "./mode-choice";
import { RecoveryForm } from "./recovery-form";
import {
  SESSION_COOKIE_NAME,
  findConversationBySessionToken,
  verifySecret,
} from "@/lib/session";
import { supabaseServer } from "@/lib/supabase-server";

export const metadata = {
  title: "Discussion anonyme — La Parole Avant Tout",
};

export default async function DiscussionAnonymePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const etapeParam = Array.isArray(params.etape) ? params.etape[0] : params.etape;
  const convParam = Array.isArray(params.conv) ? params.conv[0] : params.conv;
  const erreurParam = Array.isArray(params.erreur) ? params.erreur[0] : params.erreur;

  const etapePrete = etapeParam === "pret";
  const erreurEphemere = erreurParam === "ephemere";
  const conversationId =
    typeof convParam === "string" && convParam.length > 0 ? convParam : null;

  if (etapePrete && !conversationId) {
    redirect("/discussion-anonyme");
  }

  // Atterrissage "à froid" (ni etape=pret ni conv dans l'URL) : cherche une
  // Conversation "Sauvegarder" retrouvée par cookie avant d'afficher la
  // divulgation/choix de mode (FR-2). Aucune correspondance ou pas de cookie
  // → parcours normal, sans erreur (AC #2, #3).
  if (!etapePrete && !conversationId && !erreurEphemere) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      const conversationTrouvee =
        await findConversationBySessionToken(sessionToken);

      if (conversationTrouvee) {
        redirect(`/discussion-anonyme?etape=pret&conv=${conversationTrouvee.id}`);
      }
    }
  }

  let messages: Message[] = [];

  if (etapePrete && conversationId) {
    // Comme findConversationBySessionToken (Task 1), un incident Supabase
    // transitoire ici ne doit jamais faire planter la page (NFR-2) — traité
    // comme un conv introuvable, même garde-fou que la ligne absente.
    let conversation: {
      id: string;
      is_ephemeral: boolean;
      session_token_hash: string | null;
    } | null = null;

    try {
      const { data, error } = await supabaseServer
        .from("conversations")
        .select("id, is_ephemeral, session_token_hash")
        .eq("id", conversationId)
        .maybeSingle();

      conversation = error ? null : data;
    } catch {
      conversation = null;
    }

    if (!conversation) {
      redirect("/discussion-anonyme");
    }

    // Une Conversation "Sauvegarder" ne s'affiche que pour le cookie qui lui
    // correspond — sinon un conv deviné/copié dans l'URL exposerait les
    // messages d'un autre élève (AC #5). Le mode Éphémère n'a par
    // construction aucun cookie à vérifier (AD-5, AC #6).
    if (!conversation.is_ephemeral) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

      const autorise =
        !!sessionToken &&
        !!conversation.session_token_hash &&
        (await verifySecret(sessionToken, conversation.session_token_hash));

      if (!autorise) {
        redirect("/discussion-anonyme");
      }
    }

    try {
      const { data, error } = await supabaseServer
        .from("messages")
        .select("id, sender_type, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      messages = error ? [] : (data ?? []);
    } catch {
      messages = [];
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Discussion anonyme
        </h1>

        <div className="mt-4 space-y-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            Tu peux écrire ici sans donner ton nom, ton email, ni rien qui
            permette de te reconnaître. Une vraie personne du lycée va lire ce
            que tu écris et te répondre — pas un robot.
          </p>
        </div>

        {etapePrete && conversationId ? (
          <div className="mt-6 space-y-4">
            <ConversationThread messages={messages} />
            <MessageForm conversationId={conversationId} />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Avant de commencer, choisis comment tu veux discuter :
            </p>

            {erreurEphemere && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                Une erreur est survenue pendant la création de ta
                conversation. Réessaie.
              </p>
            )}

            <ModeChoiceSauvegarder />

            <RecoveryForm />

            <form
              action={choisirModeEphemere}
              className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                Chat éphémère
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Rien n&apos;est sauvegardé : pas de Code, pas de cookie.
              </p>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Attention : tu ne pourras pas revenir plus tard lire une
                réponse.
              </p>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Ne partage jamais le lien de cette page une fois ta
                conversation commencée, et ne le mets pas dans tes favoris :
                n&apos;importe qui l&apos;ayant pourrait écrire à ta place.
              </p>
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:text-zinc-50"
              >
                Continuer en éphémère
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
