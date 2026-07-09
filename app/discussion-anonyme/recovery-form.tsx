"use client";

import { useActionState } from "react";
import {
  recupererConversationParCode,
  type RecupererCodeState,
} from "./actions";

const initialState: RecupererCodeState = { error: null };

export function RecoveryForm() {
  const [state, formAction, isPending] = useActionState(
    recupererConversationParCode,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
    >
      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
        J&apos;ai déjà un Code
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Retrouve ta conversation depuis n&apos;importe quel appareil en
        saisissant le Code que tu as créé.
      </p>

      <div>
        <label
          className="block text-sm text-zinc-700 dark:text-zinc-300"
          htmlFor="recovery-code"
        >
          Ton Code
        </label>
        <input
          id="recovery-code"
          name="code"
          type="text"
          minLength={6}
          maxLength={20}
          required
          pattern="[a-zA-Z0-9]{6,20}"
          autoComplete="off"
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
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-50"
      >
        {isPending ? "Vérification…" : "Retrouver ma conversation"}
      </button>
    </form>
  );
}
