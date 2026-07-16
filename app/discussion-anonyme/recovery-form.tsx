"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  recupererConversationParCode,
  type RecupererCodeState,
} from "./actions";

const initialState: RecupererCodeState = { error: null };

/*
  « J'ai un Code » tab panel — rendered inside the mode Tabs on
  discussion-anonyme (no card border of its own).
*/
export function RecoveryForm() {
  const [state, formAction, isPending] = useActionState(
    recupererConversationParCode,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Retrouve ta conversation depuis n&apos;importe quel appareil en
        saisissant le Code que tu as créé.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recovery-code">Ton Code</Label>
        <Input
          id="recovery-code"
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

      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Vérification…" : "Retrouver ma conversation"}
      </Button>
    </form>
  );
}
