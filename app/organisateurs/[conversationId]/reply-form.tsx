"use client";

import { SendIcon } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

import { repondre, type RepondreState } from "../actions";

const initialState: RepondreState = { error: null, success: false };

/*
  Input de réponse compact façon messagerie, pinné en bas du layout de chat
  plein écran par la page. Même ergonomie que le MessageForm côté élève :
  textarea compacte + bouton d'envoi à droite ; Entrée envoie, Maj+Entrée
  insère un retour à la ligne.
*/
export function ReplyForm({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    repondre.bind(null, conversationId),
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={formAction} className="flex items-end gap-2">
        <label htmlFor="message" className="sr-only">
          Ta réponse
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={4000}
          rows={2}
          placeholder="Écris ta réponse…"
          className="min-h-0 flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !isPending) {
              event.preventDefault();
              // requestSubmit (et non submit()) pour que la validation
              // `required` du navigateur s'exécute avant la Server Action.
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending}
          aria-label={isPending ? "Envoi en cours" : "Envoyer la réponse"}
        >
          <SendIcon aria-hidden />
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}
