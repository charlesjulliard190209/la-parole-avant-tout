import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { supabaseServer } from "./supabase-server";

export const SESSION_COOKIE_NAME = "session_token";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // ~12 mois (AD-5)
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Génère un session_token aléatoire, jamais prévisible (AD-5).
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function hashSecret(valeur: string): Promise<string> {
  return bcrypt.hash(valeur, BCRYPT_SALT_ROUNDS);
}

export async function verifySecret(
  valeur: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(valeur, hash);
}

/**
 * bcrypt sale chaque hachage différemment : deux hachages du même Code ne
 * sont jamais identiques. Impossible de vérifier l'unicité par une requête
 * SQL sur recovery_code_hash — on compare le candidat à chaque hachage
 * existant (bcrypt.compare), en O(n) sur le nombre de Conversations
 * "Sauvegarder". Acceptable à l'échelle d'un lycée (NFR-1).
 */
export async function isCodeAvailable(code: string): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from("conversations")
    .select("recovery_code_hash")
    .not("recovery_code_hash", "is", null);

  if (error) {
    throw new Error(
      `Impossible de vérifier la disponibilité du Code : ${error.message}`
    );
  }

  for (const row of data ?? []) {
    if (row.recovery_code_hash && (await verifySecret(code, row.recovery_code_hash))) {
      return false;
    }
  }

  return true;
}

/**
 * Pose le cookie de session (httpOnly, ~12 mois). Uniquement pour le mode
 * "Sauvegarder" — le mode éphémère ne pose jamais ce cookie (AD-5, FR-19).
 */
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
}
