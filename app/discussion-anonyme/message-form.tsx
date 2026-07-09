"use client";

import { useActionState, useEffect, useRef } from "react";
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
    <div className="space-y-3">
      <form
        ref={formRef}
        action={formAction}
        className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <div>
          <label
            className="block text-sm text-zinc-700 dark:text-zinc-300"
            htmlFor="message"
          >
            Ton message
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={4000}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {isPending ? "Envoi…" : "Envoyer"}
        </button>
      </form>

      {state.accuse && (
        <p className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
          {state.accuse}
        </p>
      )}
    </div>
  );
}
