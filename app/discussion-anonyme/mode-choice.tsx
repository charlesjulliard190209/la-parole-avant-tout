"use client";

import { useActionState } from "react";
import {
  choisirModeSauvegarder,
  type ChoisirModeSauvegarderState,
} from "./actions";

const initialState: ChoisirModeSauvegarderState = { error: null };

export function ModeChoiceSauvegarder() {
  const [state, formAction, isPending] = useActionState(
    choisirModeSauvegarder,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
    >
      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
        Sauvegarder ma conversation
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Choisis un Code (6 à 20 lettres et/ou chiffres) pour pouvoir
        retrouver ta conversation plus tard, même depuis un autre appareil.
      </p>
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Ce Code est un secret : ne le partage avec personne, quiconque le
        connaît peut lire ta conversation.
      </p>

      <div>
        <label
          className="block text-sm text-zinc-700 dark:text-zinc-300"
          htmlFor="code"
        >
          Ton Code
        </label>
        <input
          id="code"
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
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {isPending ? "Création…" : "Créer mon Code et sauvegarder"}
      </button>
    </form>
  );
}
