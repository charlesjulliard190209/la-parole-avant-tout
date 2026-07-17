import { ArrowLeftIcon, BookmarkIcon, HourglassIcon, KeyRoundIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { choisirModeEphemere } from "./actions";
import { AutoRefresh } from "./auto-refresh";
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

  // "Cold" landing (neither etape=pret nor conv in the URL): look for a
  // "Sauvegarder" Conversation recoverable via cookie before showing the
  // disclosure/mode choice (FR-2). No match or no cookie → normal flow,
  // without an error (AC #2, #3).
  // etape=choix = deliberate return from a conversation: without this
  // exception, the "Sauvegarder" cookie would immediately redirect back to
  // the conversation and the back button would loop.
  const retourAuChoix = etapeParam === "choix";

  if (!etapePrete && !conversationId && !erreurEphemere && !retourAuChoix) {
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
  let lastOrganizerReadAt: string | null = null;

  if (etapePrete && conversationId) {
    // Like findConversationBySessionToken (Task 1), a transient Supabase
    // incident here must never crash the page (NFR-2) — treated as a
    // not-found conv, same guard as a missing row.
    let conversation: {
      id: string;
      is_ephemeral: boolean;
      session_token_hash: string | null;
      last_organizer_read_at: string | null;
    } | null = null;

    try {
      const { data, error } = await supabaseServer
        .from("conversations")
        .select("id, is_ephemeral, session_token_hash, last_organizer_read_at")
        .eq("id", conversationId)
        .maybeSingle();

      conversation = error ? null : data;
    } catch {
      conversation = null;
    }

    if (!conversation) {
      redirect("/discussion-anonyme");
    }

    // A "Sauvegarder" Conversation is only shown to the cookie that matches
    // it — otherwise a guessed/copied conv in the URL would expose another
    // student's messages (AC #5). The ephemeral mode, by construction, has
    // no cookie to check (AD-5, AC #6).
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

    // ✓✓ on the student's own messages = the Organisateurs have read them
    // (same definition as "traitée" : created_at <= last_organizer_read_at).
    lastOrganizerReadAt = conversation.last_organizer_read_at;

    // last_student_read_at lives in its own best-effort query, NOT in the
    // critical conversation select above: the migration adding it
    // (20260716100000) may not be applied yet on an environment we don't
    // control — a missing column must only disable the ✓✓ receipts, never
    // redirect the student out of their conversation.
    let lastStudentReadAt: string | null = null;
    let lectureEleveDisponible = false;

    try {
      const { data, error } = await supabaseServer
        .from("conversations")
        .select("last_student_read_at")
        .eq("id", conversationId)
        .maybeSingle();

      if (!error && data) {
        lastStudentReadAt = data.last_student_read_at;
        lectureEleveDisponible = true;
      }
    } catch {
      // Column (or Supabase) unavailable : receipts silently off.
    }

    // Mirror of marquerLu() on the Organisateur side : displaying the thread
    // means the student has read the replies. Only written when there is an
    // organizer message newer than the current mark (one conditional write,
    // not one per 5s poll), and never on a failed messages load (messages is
    // [] then — fail-safe, same philosophy as the Organisateur page).
    const dernierMessageOrganisateur = [...messages]
      .reverse()
      .find((message) => message.sender_type === "organisateur");

    if (
      lectureEleveDisponible &&
      dernierMessageOrganisateur &&
      (!lastStudentReadAt ||
        Date.parse(lastStudentReadAt) <
          Date.parse(dernierMessageOrganisateur.created_at))
    ) {
      after(async () => {
        const { error } = await supabaseServer
          .from("conversations")
          .update({ last_student_read_at: new Date().toISOString() })
          .eq("id", conversationId);

        if (error) {
          console.error(
            "Échec de la mise à jour last_student_read_at :",
            conversationId,
            error.message
          );
        }
      });
    }
  }

  return (
    <>
      {/* Always-visible header (back to home, navigation): no hero and no
          `#hero-logo-sentinel` sentinel here — same pattern as
          /camarade-exclu. Rendered OUTSIDE <main> to keep the "banner"
          landmark role. */}
      <SiteHeader alwaysVisible />

      <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Discussion anonyme
          </h1>

          <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Tu peux écrire ici sans donner ton nom, ton email, ni rien qui
              permette de te reconnaître. Une vraie personne du lycée va lire ce
              que tu écris et te répondre — pas un robot.
            </p>
          </div>

          {etapePrete && conversationId ? (
            <div className="mt-6 flex flex-col gap-4">
              <AutoRefresh />
              <div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="-ml-2 text-muted-foreground"
                >
                  <Link href="/discussion-anonyme?etape=choix">
                    <ArrowLeftIcon aria-hidden />
                    Retour au choix du mode
                  </Link>
                </Button>
              </div>
              <ConversationThread
                messages={messages}
                lastOrganizerReadAt={lastOrganizerReadAt}
              />
              <MessageForm conversationId={conversationId} />
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Avant de commencer, choisis comment tu veux discuter :
              </p>

              {erreurEphemere && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  Une erreur est survenue pendant la création de ta
                  conversation. Réessaie.
                </p>
              )}

              {/*
                The three modes as tabs: stacked forms were unreadable on
                mobile. Icons hide below `sm` so the three labels fit on a
                phone-width TabsList.
              */}
              <Tabs defaultValue="sauvegarder">
                <TabsList>
                  <TabsTrigger value="sauvegarder">
                    <BookmarkIcon aria-hidden className="hidden sm:block" />
                    Sauvegarder
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <KeyRoundIcon aria-hidden className="hidden sm:block" />
                    Mon Code
                  </TabsTrigger>
                  <TabsTrigger value="ephemere">
                    <HourglassIcon aria-hidden className="hidden sm:block" />
                    Éphémère
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sauvegarder">
                  <ModeChoiceSauvegarder />
                </TabsContent>

                <TabsContent value="code">
                  <RecoveryForm />
                </TabsContent>

                <TabsContent value="ephemere">
                  <form
                    action={choisirModeEphemere}
                    className="flex flex-col gap-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Rien n&apos;est sauvegardé : pas de Code, pas de cookie.
                    </p>
                    <div className="flex flex-col gap-2 rounded-lg border border-accent bg-accent/50 p-3 text-sm font-medium text-accent-foreground">
                      <p>
                        Attention : tu ne pourras pas revenir plus tard lire une
                        réponse.
                      </p>
                      <p>
                        Ne partage jamais le lien de cette page une fois ta
                        conversation commencée, et ne le mets pas dans tes
                        favoris : n&apos;importe qui l&apos;ayant pourrait écrire
                        à ta place.
                      </p>
                    </div>
                    <Button type="submit" variant="outline" className="w-full">
                      Continuer en éphémère
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
