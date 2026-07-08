export const metadata = {
  title: "Discussion anonyme — La Parole Avant Tout",
};

export default function DiscussionAnonymePage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:py-16">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Discussion anonyme
        </h1>

        <div className="mt-4 space-y-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            Tu peux écrire ici sans donner ton nom, ton email, ni rien qui
            permette de te reconnaître. Une vraie personne du lycée va lire ce
            que tu écris et te répondre — pas un robot.
          </p>
          <p>
            Une seule limite : si ce que tu écris fait penser à un danger
            sérieux pour toi, des numéros d&apos;aide s&apos;affichent tout de
            suite, automatiquement — même avant qu&apos;on ait pu lire ton
            message.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            La suite (choisir comment retrouver ta conversation, puis écrire
            ton message) arrive juste après.
          </p>
        </div>
      </div>
    </main>
  );
}
