export type Message = {
  id: string;
  sender_type: "eleve" | "organisateur";
  body: string;
  created_at: string;
};

// WhatsApp-style receipt on the sender's own messages: ✓ = stored (it is in
// the database if it renders here), ✓✓ = the other side has displayed the
// thread since this message was sent.
function AccuseLecture({ lu }: { lu: boolean }) {
  return (
    <span
      className="mt-1 block text-right text-[11px] leading-none opacity-70"
      title={lu ? "Lu" : "Reçu"}
      aria-label={lu ? "Lu" : "Reçu"}
    >
      {lu ? "✓✓" : "✓"}
    </span>
  );
}

/*
  Bicolor conversation — the « Aube » signature: the student speaks in
  peach (accent, right-aligned), the team answers in sky blue (secondary,
  left-aligned). The color says who is talking.
*/
export function ConversationThread({
  messages,
  lastOrganizerReadAt,
}: {
  messages: Message[];
  // ✓✓ threshold for the student's own messages (null = never read).
  lastOrganizerReadAt: string | null;
}) {
  if (messages.length === 0) {
    // Conversation toute neuve (juste après la création du Code ou en mode
    // éphémère) : sans ce texte, la page semble identique à l'étape
    // précédente et l'Élève ne comprend pas qu'il est déjà « dans » sa
    // conversation, prêt à écrire.
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Ta conversation est prête. Écris ton premier message ci-dessous — une
        vraie personne du lycée te répondra.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const estEleve = message.sender_type === "eleve";

        return (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-xl border p-4 text-sm text-foreground ${
              estEleve
                ? "self-end border-accent bg-accent/50"
                : "self-start border-secondary bg-secondary/50"
            }`}
          >
            <p
              className={`mb-1 text-xs font-semibold ${
                estEleve ? "text-accent-foreground" : "text-secondary-foreground"
              }`}
            >
              {estEleve ? "Toi" : "L'équipe"}
            </p>
            <p className="whitespace-pre-wrap">{message.body}</p>
            {estEleve && (
              <AccuseLecture
                lu={
                  !!lastOrganizerReadAt &&
                  Date.parse(message.created_at) <=
                    Date.parse(lastOrganizerReadAt)
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
