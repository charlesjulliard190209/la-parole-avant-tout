import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { requireEnv } from "./env";

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabasePublishableKey = requireEnv("SUPABASE_PUBLISHABLE_KEY");

// Allowlist de défense en profondeur (AC #4/AD-8 : exactement deux comptes
// Organisateur). Supabase Auth ne distingue par lui-même aucun "rôle" pour
// un compte email/mot de passe simple — requireOrganisateur() ne doit donc
// pas se contenter de "un utilisateur Supabase authentifié existe" (ça
// vaudrait pour n'importe quel compte de ce projet), mais vérifier que c'est
// spécifiquement l'un des comptes provisionnés à la main (Task 5). Rempli
// par Charles dans .env.local (voir .env.local.example), même mécanisme que
// SUPABASE_PUBLISHABLE_KEY.
const organisateurEmails = new Set(
  requireEnv("ORGANISATEUR_EMAILS")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

/**
 * Client Supabase pour la session Auth des Organisateurs (Story 3.1),
 * distinct de lib/supabase-server.ts (clé service, réservé à
 * conversations/messages/recovery_attempts, AD-4). Utilise la clé
 * publishable + les cookies de session — jamais la clé service, qui n'a pas
 * de notion d'utilisateur connecté.
 *
 * À appeler dans les Server Components/Server Actions (utilise next/headers).
 * Ne jamais réutiliser un client entre requêtes : en créer un nouveau à
 * chaque appel.
 */
export async function createSupabaseAuthServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Un Server Component ne peut pas écrire de cookies (lecture
          // seule) — sans conséquence dans ce cas précis, proxy.ts (Task 2)
          // se charge du rafraîchissement optimiste sur ces routes. Mais ce
          // même client est aussi utilisé depuis des Server Actions
          // (seConnecter/seDeconnecter), où une écriture de cookie qui
          // échoue *est* un vrai problème (ex. connexion "réussie" sans
          // session réellement posée) — logué pour garder une trace, sans
          // jamais bloquer l'appelant (NFR-2, disponibilité).
          console.error(
            "Échec d'écriture de cookie de session Organisateur :",
            error
          );
        }
      },
    },
  });
}

/**
 * Variante du client Auth pour proxy.ts (Task 2) : signature différente
 * (next/headers indisponible en proxy), lit/écrit directement sur la
 * NextRequest/NextResponse. Retourne aussi la réponse à renvoyer, pour que
 * les cookies rafraîchis soient bien transmis au navigateur.
 */
export function createSupabaseAuthProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, response: () => response };
}

/**
 * Vérification authoritative à appeler dans chaque Server Component/Server
 * Action protégé (AD-3 : chaque frontière vérifie elle-même son
 * autorisation, jamais une vérification supposée déjà faite ailleurs).
 * proxy.ts (Task 2) ne fait qu'un contrôle optimiste (JWT validé localement,
 * pattern "Thin Proxy" de Next.js 16.1) pour rediriger vite ; cette fonction
 * fait le contrôle définitif via getUser(), qui revalide auprès du serveur
 * Auth Supabase (détecte une session révoquée, un compte supprimé, etc.) —
 * jamais getSession() seul pour cette décision. Vérifie aussi l'appartenance
 * à `organisateurEmails` : un utilisateur Supabase authentifié n'est pas
 * forcément un Organisateur (voir commentaire sur `organisateurEmails`
 * ci-dessus).
 *
 * Enveloppée dans React `cache()` : plusieurs appels dans la même requête
 * (ex. un futur layout + une page, ou une page + une Server Action qu'elle
 * déclenche) partagent un seul appel réseau à `getUser()` au lieu de le
 * répéter — cette fonction est pensée comme fondation réutilisable par
 * Story 3.2+ (voir Dev Notes de la story 3.1).
 */
export const requireOrganisateur = cache(async (): Promise<User> => {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    !user.email ||
    !organisateurEmails.has(user.email.toLowerCase())
  ) {
    redirect("/organisateurs/connexion");
  }

  return user;
});
