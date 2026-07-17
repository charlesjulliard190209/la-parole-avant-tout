import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrganisateur } from "@/lib/supabase-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { marquerLu } from "../actions";
import { ConversationThread, type Message } from "./conversation-thread";
import { ReplyForm } from "./reply-form";

export const metadata = {
  title: "Conversation — Organisateurs — La Parole Avant Tout",
};

type ConversationRow = {
  id: string;
  is_priority: boolean;
  is_ephemeral: boolean;
};

// requireOrganisateur() est le contrôle authoritatif (AD-3) — cette page ne
// suppose jamais qu'une vérification a déjà eu lieu ailleurs, même précédent
// que app/organisateurs/page.tsx.
export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  await requireOrganisateur();

  const { conversationId } = await params;

  // Une erreur Supabase transitoire et un id inexistant mènent au même
  // redirect générique, sans distinction entre les deux cas (AC #6, pas de
  // fuite d'info — même principe que app/discussion-anonyme/page.tsx:68-78).
  // ?erreur=conversation ne révèle jamais lequel des deux cas s'est produit
  // — il signale juste "quelque chose a empêché l'ouverture", affiché en
  // bandeau sur la liste plutôt que de rediriger en silence total (revue de
  // code, 2026-07-16).
  let conversation: ConversationRow | null = null;

  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, is_priority, is_ephemeral")
      .eq("id", conversationId)
      .maybeSingle();

    if (error) {
      console.error(
        "Échec de la requête conversation (détail Organisateurs) :",
        conversationId,
        error.message
      );
    }

    conversation = error ? null : data;
  } catch (error) {
    console.error(
      "Exception lors de la requête conversation (détail Organisateurs) :",
      conversationId,
      error
    );
    conversation = null;
  }

  if (!conversation) {
    redirect("/organisateurs?erreur=conversation");
  }

  let messages: Message[] = [];
  let erreurMessages = false;

  try {
    const { data, error } = await supabaseServer
      .from("messages")
      .select("id, sender_type, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Échec de la requête messages (détail Organisateurs) :",
        conversationId,
        error.message
      );
      erreurMessages = true;
    }

    messages = error ? [] : (data ?? []);
  } catch (error) {
    console.error(
      "Exception lors de la requête messages (détail Organisateurs) :",
      conversationId,
      error
    );
    erreurMessages = true;
  }

  // last_student_read_at en requête séparée best-effort (même motif que côté
  // élève) : tant que la migration 20260716100000 n'est pas appliquée, la
  // colonne n'existe pas — on affiche alors ✓ au lieu de ✓✓, sans jamais
  // empêcher l'ouverture de la conversation.
  let lastStudentReadAt: string | null = null;

  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("last_student_read_at")
      .eq("id", conversationId)
      .maybeSingle();

    if (!error && data) {
      lastStudentReadAt = data.last_student_read_at;
    }
  } catch {
    // Colonne (ou Supabase) indisponible : accusés silencieusement désactivés.
  }

  // Ne marque comme lue que si le chargement des messages a réellement
  // réussi (AC #4) — en cas d'échec, on ne sait pas ce que l'Organisateur a
  // vu, donc on préfère laisser la Conversation "non traitée" plutôt que de
  // risquer de la faire disparaître silencieusement de la file (même
  // philosophie fail-safe que chargerConversations(), Story 3.2 : toute
  // incertitude penche vers plus de visibilité, jamais moins).
  if (!erreurMessages) {
    await marquerLu(conversationId);
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Conversation
          </h1>

          <Link
            href="/organisateurs"
            className="text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            ← Retour à la liste
          </Link>
        </div>

        {(conversation.is_priority || conversation.is_ephemeral) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {conversation.is_priority && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                Prioritaire
              </span>
            )}
            {conversation.is_ephemeral && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Éphémère
              </span>
            )}
          </div>
        )}

        {erreurMessages && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-600 dark:text-red-400"
          >
            Erreur de chargement des messages. Réessaie dans quelques
            instants.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <ConversationThread
            messages={messages}
            lastStudentReadAt={lastStudentReadAt}
          />
          <ReplyForm conversationId={conversationId} />
        </div>
      </div>
    </main>
  );
}
