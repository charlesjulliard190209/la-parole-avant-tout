"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { envoyerMessage, type EnvoyerMessageState } from "./actions";

const initialState: EnvoyerMessageState = { error: null, accuse: null };

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
    <div className="flex flex-col gap-3">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="message">Ton message</Label>
          <Textarea
            id="message"
            name="message"
            required
            maxLength={4000}
            rows={4}
            placeholder="Écris ce que tu as sur le cœur…"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Envoi…" : "Envoyer"}
        </Button>
      </form>

      {state.accuse && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-secondary bg-secondary/40 p-4 text-sm text-secondary-foreground"
        >
          {state.accuse}
        </p>
      )}
    </div>
  );
}
