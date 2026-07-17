"use client";

import { SendIcon } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { envoyerMessage, type EnvoyerMessageState } from "./actions";

const initialState: EnvoyerMessageState = { error: null, accuse: null };

/*
  Classic messenger input (Fab, 2026-07-17): compact textarea with the send
  button on its right, pinned at the bottom of the full-screen chat layout
  by the page. Enter sends, Shift+Enter inserts a newline — same convention
  as every desktop messaging app; on mobile most students tap the button.
*/
export function MessageForm({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    envoyerMessage.bind(null, conversationId),
    initialState
  );

  useEffect(() => {
    if (state.accuse) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={formAction} className="flex items-end gap-2">
        <label htmlFor="message" className="sr-only">
          Ton message
        </label>
        <Textarea
          id="message"
          name="message"
          required
          maxLength={4000}
          rows={2}
          placeholder="Écris ce que tu as sur le cœur…"
          className="min-h-0 flex-1 resize-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !isPending) {
              event.preventDefault();
              // requestSubmit (not submit()) so the browser still runs the
              // `required` validation before firing the Server Action.
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending}
          aria-label={isPending ? "Envoi en cours" : "Envoyer"}
        >
          <SendIcon aria-hidden />
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      {state.accuse && (
        <p
          role="status"
          aria-live="polite"
          className="text-xs text-muted-foreground"
        >
          {state.accuse}
        </p>
      )}
    </div>
  );
}
