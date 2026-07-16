// Seule Route Handler du projet (tout le reste passe par des Server Actions,
// AD-3) — justifiée car ce n'est pas une écriture applicative déclenchée par
// un navigateur, mais le point d'entrée pour Vercel Cron (FR-15, AD-7),
// anticipé par le Structural Seed du Spine. Vercel déclenche toujours un GET
// et envoie automatiquement CRON_SECRET dans l'en-tête Authorization —
// pattern officiel Vercel, reproduit tel quel (voir Dev Notes Story 3.5).

import type { NextRequest } from "next/server";
import { envoyerRelancesEnRetard } from "@/lib/relance";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { relancesEnvoyees } = await envoyerRelancesEnRetard();

  return Response.json({ success: true, relancesEnvoyees });
}
