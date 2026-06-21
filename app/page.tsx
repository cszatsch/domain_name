import { DomainSearch } from "@/components/DomainSearch";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-12 sm:py-20">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Trouvez votre nom de domaine
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-zinc-600 dark:text-zinc-400">
          Disponibilité en temps réel sur les principales extensions, à partir d&apos;un simple
          mot, d&apos;une marque ou d&apos;un thème. Prix et potentiel de visibilité à venir.
        </p>
      </header>

      <DomainSearch />
    </main>
  );
}
