export type Message = {
  id: string;
  sender_type: "eleve" | "organisateur";
  body: string;
  created_at: string;
};

// Variante organisateur de app/discussion-anonyme/conversation-thread.tsx :
// mêmes messages, labels inversés (point de vue Organisateur, pas Élève).
// Dupliqué plutôt que partagé via un prop de labels — cohérent avec la
// préférence déjà actée dans ce projet pour la duplication à cette échelle.
export function ConversationThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const estEleve = message.sender_type === "eleve";

        return (
          <div
            key={message.id}
            className={`rounded-xl border p-4 text-sm ${
              estEleve
                ? "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {estEleve ? "Élève" : "Toi"}
            </p>
            <p className="whitespace-pre-wrap">{message.body}</p>
          </div>
        );
      })}
    </div>
  );
}
