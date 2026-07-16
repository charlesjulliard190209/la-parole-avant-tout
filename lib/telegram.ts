// Notification Telegram des Organisateurs (AD-7, FR-7, FR-10). Un seul bot,
// un seul mécanisme : chaque message élève notifie systématiquement tous les
// chat_id configurés (donc les deux Organisateurs), qu'il soit prioritaire ou
// non — AD-7 interdit explicitement un canal "normal" distinct d'un canal
// "urgence" (complexité dupliquée pour un bénéfice nul à cette échelle). Seul
// le texte varie selon estPrioritaire.
//
// Contrairement à lib/supabase-server.ts/lib/supabase-auth.ts, les variables
// d'environnement ne sont volontairement PAS lues via requireEnv() au
// chargement du module : ce module est importé par
// app/discussion-anonyme/actions.ts, donc un throw ici casserait tout le chat
// Élève à cause d'une notification mal configurée — contraire à NFR-2 ("le
// chat doit rester accessible en continu, même si la réponse humaine ne l'est
// pas"). Les variables sont donc lues à l'intérieur de la fonction, avec un
// retour silencieux (loggué) si absentes.

const TELEGRAM_API_BASE = "https://api.telegram.org";

function getChatIds(): string[] {
  return (process.env.TELEGRAM_CHAT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function buildTexte(conversationId: string, estPrioritaire: boolean): string {
  const entete = estPrioritaire
    ? "⚠️ Conversation prioritaire — nouveau message."
    : "Nouveau message reçu.";

  // Jamais le corps du message élève ici (catégorie de données sensibles,
  // NFR-9) : la lecture se fait uniquement dans l'interface Organisateurs
  // protégée, jamais dans la notification elle-même (cf. prd.md §3.3,
  // parcours "il ouvre la notification → arrive directement sur la
  // conversation → lit le message").
  const siteUrl = process.env.SITE_URL;
  const lien = siteUrl ? `\n${siteUrl}/organisateurs/${conversationId}` : "";

  return `${entete}${lien}`;
}

/**
 * Envoie une notification aux deux Organisateurs (tous les chat_id
 * configurés) après un nouveau message élève. Ne lève jamais d'exception vers
 * l'appelant — même philosophie que recordRecoveryAttempt (lib/session.ts) :
 * toute erreur est avalée et journalisée (métadonnées seulement, jamais de
 * secret ni de contenu de message), pour ne jamais bloquer l'Élève (NFR-2).
 *
 * Retourne `true` si au moins un chat_id a effectivement reçu le message,
 * `false` sinon (config manquante, ou tous les chat_id en échec) — utilisé
 * par lib/relance.ts (Story 3.5) pour décider si une relance doit être
 * considérée comme envoyée avant de la marquer comme telle en base (revue de
 * code, 2026-07-16 : un appel à app/discussion-anonyme/actions.ts ignore
 * cette valeur de retour sans risque, il ne fait qu'un `after()` fire-and-
 * forget).
 */
export async function notifierNouveauMessage(
  conversationId: string,
  estPrioritaire: boolean
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getChatIds();

  if (!token || chatIds.length === 0) {
    console.error(
      "Notification Telegram non envoyée : configuration manquante (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_IDS)."
    );
    return false;
  }

  const texte = buildTexte(conversationId, estPrioritaire);
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

  // Promise.allSettled, jamais Promise.all : un chat_id en échec (ex. un
  // Organisateur a bloqué le bot) ne doit jamais empêcher l'envoi vers
  // l'autre — "jamais un seul face à la décision d'escalade" (FR-10).
  const resultats = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const reponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: texte }),
      });

      if (!reponse.ok) {
        throw new Error(`HTTP ${reponse.status}`);
      }

      const corpsReponse = (await reponse.json()) as { ok: boolean };
      if (!corpsReponse.ok) {
        // Telegram peut renvoyer un statut HTTP 200 avec `ok: false` sur
        // certaines erreurs (ex. chat_id invalide) — traité comme un échec.
        throw new Error("Réponse Telegram ok:false");
      }
    })
  );

  let auMoinsUnSucces = false;

  resultats.forEach((resultat, index) => {
    if (resultat.status === "rejected") {
      console.error(
        "Échec d'envoi de la notification Telegram pour un chat_id :",
        chatIds[index],
        resultat.reason
      );
    } else {
      auMoinsUnSucces = true;
    }
  });

  return auMoinsUnSucces;
}
