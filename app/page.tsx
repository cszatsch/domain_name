import { Sparkles } from "lucide-react";

import { DomainSearch } from "@/components/DomainSearch";
import { Reveal } from "@/components/ui/Reveal";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16 sm:py-24">
      <Reveal className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-soft backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Disponibilité · Prix · Visibilité
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-[3.25rem] sm:leading-[1.05]">
          Trouvez le nom de domaine{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            parfait
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-slate-500 sm:text-lg">
          Un mot, une marque, un thème — et une vue d&apos;ensemble instantanée : extensions
          disponibles, prix d&apos;achat et de renouvellement, et potentiel de visibilité.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <DomainSearch />
      </Reveal>
    </main>
  );
}
