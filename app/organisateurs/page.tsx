import { requireOrganisateur } from "@/lib/supabase-auth";
import { seDeconnecter } from "./actions";

export const metadata = {
  title: "Organisateurs — La Parole Avant Tout",
};

// Placeholder protégé (Story 3.1) — la vraie liste des conversations (FR-5)
// est construite par la Story 3.2, qui remplace ce contenu. proxy.ts fait un
// contrôle optimiste (JWT local) sur cette route ; requireOrganisateur() ici
// est le contrôle authoritatif (getUser(), revalidé auprès de Supabase) —
// cette page ne suppose jamais qu'une vérification a déjà eu lieu ailleurs
// (AD-3).
export default async function OrganisateursPage() {
  await requireOrganisateur();

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Espace Organisateurs
        </h1>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Tu es connecté.
        </p>

        <form action={seDeconnecter} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:text-zinc-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </main>
  );
}
