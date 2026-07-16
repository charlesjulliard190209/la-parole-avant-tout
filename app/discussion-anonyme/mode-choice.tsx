"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  choisirModeSauvegarder,
  type ChoisirModeSauvegarderState,
} from "./actions";

const initialState: ChoisirModeSauvegarderState = { error: null };

/*
  « Sauvegarder » tab panel — rendered inside the mode Tabs on
  discussion-anonyme, so it carries no card border of its own (the tab
  trigger already names it).
*/
export function ModeChoiceSauvegarder() {
  const [state, formAction, isPending] = useActionState(
    choisirModeSauvegarder,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Choisis un Code (6 à 20 lettres et/ou chiffres) pour pouvoir retrouver
        ta conversation plus tard, même depuis un autre appareil.
      </p>
      <p className="rounded-lg border border-accent bg-accent/50 p-3 text-sm font-medium text-accent-foreground">
        Ce Code est un secret : ne le partage avec personne, quiconque le
        connaît peut lire ta conversation.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Ton Code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          minLength={6}
          maxLength={20}
          required
          pattern="[a-zA-Z0-9]{6,20}"
          autoComplete="off"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Création…" : "Créer mon Code et sauvegarder"}
      </Button>
    </form>
  );
}
