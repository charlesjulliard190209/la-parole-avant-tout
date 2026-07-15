import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthProxyClient } from "@/lib/supabase-auth";

const CONNEXION_PATH = "/organisateurs/connexion";

/**
 * Contrôle optimiste sur /organisateurs/* (FR-4, Story 3.1) : rafraîchit la
 * session Auth (pattern officiel @supabase/ssr — les Server Components ne
 * peuvent pas écrire de cookies eux-mêmes) et redirige vite si aucun JWT
 * valide n'est présent. Vérification locale (getClaims()) — sans appel
 * réseau à Supabase *si* le projet utilise des clés de signature JWT
 * asymétriques (sinon getClaims() retombe en interne sur un appel réseau
 * équivalent à getUser() ; à vérifier dans Authentication > Settings > JWT
 * du dashboard Supabase si la latence de cette route devient sensible).
 * Dans tous les cas, ceci reste un contrôle optimiste : le contrôle
 * authoritatif vit dans requireOrganisateur() (lib/supabase-auth.ts), à
 * appeler explicitement par chaque page/Server Action protégée (AD-3) —
 * voir app/organisateurs/page.tsx. Scopé par le matcher ci-dessous : ne
 * touche jamais /discussion-anonyme, qui a son propre mécanisme de session
 * indépendant (AD-5).
 */
export async function proxy(request: NextRequest) {
  // Préfixe, pas égalité stricte : couvre aussi une future sous-route (ex.
  // /organisateurs/connexion/mot-de-passe-oublie) sans qu'il faille penser à
  // revenir modifier ce fichier à ce moment-là. Exclu avant tout appel
  // Supabase : la page de connexion ne doit jamais être bloquée, et ça évite
  // un getClaims() (potentiellement réseau) inutile sur cette route.
  if (
    request.nextUrl.pathname === CONNEXION_PATH ||
    request.nextUrl.pathname.startsWith(`${CONNEXION_PATH}/`)
  ) {
    return NextResponse.next({ request });
  }

  const { supabase, response } = createSupabaseAuthProxyClient(request);

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data) {
      return redirectToConnexion(request, response);
    }

    return response();
  } catch (error) {
    // Un cookie de session corrompu peut faire lever une exception hors du
    // format d'erreur habituel de Supabase (ex. JSON invalide dans le JWT) —
    // traité comme "pas authentifié", jamais comme une erreur serveur brute.
    console.error(
      "Erreur inattendue lors de la vérification de session (proxy) :",
      error
    );
    return redirectToConnexion(request, response);
  }
}

// Construit la redirection en conservant les cookies déjà écrits par
// getClaims() (ex. nettoyage d'une session expirée/révoquée) — un simple
// NextResponse.redirect() les aurait perdus.
function redirectToConnexion(
  request: NextRequest,
  response: () => NextResponse
) {
  const redirectResponse = NextResponse.redirect(
    new URL(CONNEXION_PATH, request.url)
  );
  response()
    .cookies.getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export const config = {
  matcher: ["/organisateurs/:path*"],
};
