import { BookmarkIcon, HourglassIcon, KeyRoundIcon } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <ConversationThread messages={messages} />
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
  );
}
