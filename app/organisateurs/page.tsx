import { Button } from "@/components/ui/button";
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
    <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Espace Organisateurs
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">Tu es connecté.</p>

        <form action={seDeconnecter} className="mt-6">
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </div>
    </main>
  );
}
