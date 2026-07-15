// Garde-fou fail-fast partagé : plusieurs clients (lib/supabase-server.ts,
// lib/supabase-auth.ts) ont besoin de vérifier qu'une variable d'environnement
// requise est bien présente au chargement du module, avant toute connexion.
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}
