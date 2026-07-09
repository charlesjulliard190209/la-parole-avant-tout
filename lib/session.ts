import { createHash, randomBytes } from "crypto";
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
 * Génère un nouveau session_token et son hachage — logique partagée entre
 * choisirModeSauvegarder (création) et recupererConversationParCode
 * (réémission à la récupération par Code), qui diffèrent seulement dans la
 * façon dont le hachage est persisté (insert vs update).
 */
export async function issueSessionToken(): Promise<{
  sessionToken: string;
  sessionTokenHash: string;
}> {
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await hashSecret(sessionToken);
  return { sessionToken, sessionTokenHash };
}

/**
 * Hachage rapide (pas bcrypt) pour code_hash_attempted : ce champ n'est
 * jamais relu/comparé (simple trace d'audit, AD-9), donc le coût CPU
 * volontairement élevé de bcrypt n'apporte rien ici — sha256 suffit à
 * respecter "jamais stocké en clair" (NFR-7) sans le surcoût.
 */
function hashForAudit(valeur: string): string {
  return createHash("sha256").update(valeur).digest("hex");
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
 * Retrouve la Conversation "Sauvegarder" correspondant à un session_token de
 * cookie (retour via navigateur, FR-2). Même motif O(n) que isCodeAvailable
 * (bcrypt sale chaque hachage, impossible de comparer par requête SQL) —
 * acceptable à l'échelle d'un lycée (NFR-1).
 *
 * Contrairement à isCodeAvailable, ne lance jamais d'exception : appelée à
 * chaque chargement de la page de chat, un incident Supabase transitoire ne
 * doit jamais empêcher l'affichage du parcours normal (NFR-2).
 */
export async function findConversationBySessionToken(
  sessionToken: string
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, session_token_hash")
      .eq("is_ephemeral", false)
      .not("session_token_hash", "is", null);

    if (error) {
      return null;
    }

    for (const row of data ?? []) {
      try {
        if (
          row.session_token_hash &&
          (await verifySecret(sessionToken, row.session_token_hash))
        ) {
          return { id: row.id };
        }
      } catch {
        // Une ligne corrompue (hash malformé) ne doit pas empêcher de
        // trouver la bonne correspondance plus loin dans la liste.
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Retrouve la Conversation "Sauvegarder" correspondant à un Code de
 * récupération (FR-18). Même motif O(n) que isCodeAvailable/
 * findConversationBySessionToken — ne lance jamais d'exception, retourne
 * null sur toute erreur ou absence de correspondance (NFR-2).
 */
export async function findConversationByRecoveryCode(
  code: string
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabaseServer
      .from("conversations")
      .select("id, recovery_code_hash")
      .not("recovery_code_hash", "is", null);

    if (error) {
      return null;
    }

    for (const row of data ?? []) {
      try {
        if (
          row.recovery_code_hash &&
          (await verifySecret(code, row.recovery_code_hash))
        ) {
          return { id: row.id };
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

const RECOVERY_LOCKOUT_MAX_ATTEMPTS = 5;
const RECOVERY_LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Anti-brute-force sur le Code de récupération (AD-9, FR-18). Verrouille une
 * IP 15 minutes dès que 5 échecs se sont accumulés dans les 15 dernières
 * minutes. Compte les échecs sur la fenêtre glissante plutôt que "les 5
 * dernières tentatives, toutes en échec" : cette dernière approche pouvait
 * être contournée en intercalant une réussite (même sur un Code différent)
 * parmi les tentatives, ce qui réinitialisait le compteur sans jamais
 * déclencher le verrou. Compter les échecs sur la fenêtre ferme ce trou —
 * un élève légitime qui échoue puis réussit reste protégé de la même façon
 * (il lui faudrait 5 vrais échecs en 15 minutes pour être bloqué, comme
 * avant). Le verrouillage n'est jamais prolongé tant qu'aucune nouvelle
 * tentative n'est enregistrée (voir recupererConversationParCode, qui
 * n'appelle pas recordRecoveryAttempt pendant un verrouillage actif) — il
 * s'estompe donc naturellement à mesure que les échecs sortent de la
 * fenêtre de 15 minutes.
 *
 * Fail-open sur toute erreur Supabase (retourne "non verrouillé") : décision
 * confirmée par Charles (2026-07-09) — cohérent avec le reste du code
 * (NFR-2, disponibilité), risque jugé acceptable à cette échelle.
 */
export async function isRecoveryLocked(ip: string): Promise<boolean> {
  try {
    const windowStart = new Date(
      Date.now() - RECOVERY_LOCKOUT_WINDOW_MS
    ).toISOString();

    const { count, error } = await supabaseServer
      .from("recovery_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("success", false)
      .gte("created_at", windowStart);

    if (error || count === null) {
      return false;
    }

    return count >= RECOVERY_LOCKOUT_MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

/**
 * Enregistre une tentative de récupération par Code (AD-9). Le Code est
 * haché avant stockage (jamais en clair, NFR-7) — hachage rapide (pas
 * bcrypt), voir hashForAudit : ce champ n'est qu'une trace d'audit, jamais
 * relu/comparé. Un échec d'écriture ne doit jamais faire échouer la
 * tentative côté élève (NFR-2).
 */
export async function recordRecoveryAttempt(
  ip: string,
  code: string,
  success: boolean
): Promise<void> {
  try {
    await supabaseServer.from("recovery_attempts").insert({
      ip,
      code_hash_attempted: hashForAudit(code),
      success,
    });
  } catch {
    // Voir docstring : imprécision acceptée de la fenêtre anti-brute-force
    // plutôt qu'un échec visible pour l'élève.
  }
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
