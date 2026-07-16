import { ConnexionForm } from "./connexion-form";

export const metadata = {
  title: "Connexion Organisateurs — La Parole Avant Tout",
};

export default function ConnexionPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Connexion Organisateurs
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Réservé à Charles et Basile.
        </p>

        <div className="mt-6">
          <ConnexionForm />
        </div>
      </div>
    </main>
  );
}
