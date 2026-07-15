"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseAuthServerClient,
  requireOrganisateur,
} from "@/lib/supabase-auth";

export type SeConnecterState = {
  error: string | null;
};

const ERREUR_GENERIQUE_CONNEXION =
  "Email ou mot de passe incorrect. Réessaie.";

// Server Action : vérifie elle-même l'authentification via Supabase Auth
// (AD-3). Message d'erreur volontairement identique que l'email soit
// inconnu ou le mot de passe incorrect (AC #3) — ne jamais indiquer si un
// email existe, même principe que l'erreur de Code invalide (FR-18).
export async function seConnecter(
  _prevState: SeConnecterState,
  formData: FormData
): Promise<SeConnecterState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { error: ERREUR_GENERIQUE_CONNEXION };
  }

  const supabase = await createSupabaseAuthServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Échec de connexion Organisateur :", error.message);
    return { error: ERREUR_GENERIQUE_CONNEXION };
  }

  redirect("/organisateurs");
}

// Vérifie elle-même l'authentification avant d'agir (AD-3), comme
// seConnecter ci-dessus — ne suppose jamais que le proxy (contrôle optimiste
// uniquement, voir proxy.ts) a déjà tout vérifié.
export async function seDeconnecter(): Promise<void> {
  await requireOrganisateur();

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Échec de déconnexion Organisateur :", error.message);
  }

  redirect("/organisateurs/connexion");
}
