import { ConnexionForm } from "./connexion-form";

export const metadata = {
  title: "Connexion Organisateurs — La Parole Avant Tout",
};

export default function ConnexionPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Connexion Organisateurs
        </h1>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Réservé à Charles et Basile.
        </p>

        <div className="mt-6">
          <ConnexionForm />
        </div>
      </div>
    </main>
  );
}
