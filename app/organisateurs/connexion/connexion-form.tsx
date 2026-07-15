"use client";

import { useActionState } from "react";
import { seConnecter, type SeConnecterState } from "../actions";

const initialState: SeConnecterState = { error: null };

export function ConnexionForm() {
  const [state, formAction, isPending] = useActionState(
    seConnecter,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
    >
      <div>
        <label
          className="block text-sm text-zinc-700 dark:text-zinc-300"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          className="block text-sm text-zinc-700 dark:text-zinc-300"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
