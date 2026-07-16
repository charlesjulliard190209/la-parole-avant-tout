export type Message = {
  id: string;
  sender_type: "eleve" | "organisateur";
  body: string;
  created_at: string;
};

/*
  Bicolor conversation — the « Aube » signature: the student speaks in
  peach (accent, right-aligned), the team answers in sky blue (secondary,
  left-aligned). The color says who is talking.
*/
export function ConversationThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return null;
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
          </div>
        );
      })}
    </div>
  );
}
