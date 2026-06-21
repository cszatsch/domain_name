import type { CompetitionLevel, SeoMetrics } from "@/lib/types";

const LEVEL_LABEL: Record<CompetitionLevel, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

const LEVEL_BAR: Record<CompetitionLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

const nf = new Intl.NumberFormat("fr-FR");

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

interface SeoPanelProps {
  term: string;
  data: SeoMetrics | null;
  loading: boolean;
  error: boolean;
}

export function SeoPanel({ term, data, loading, error }: SeoPanelProps) {
  return (
    <section className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <h2 className="mb-3 text-sm font-semibold">
        Potentiel de visibilité — <span className="font-mono">{term}</span>
      </h2>

      {loading ? (
        <div className="h-16 animate-pulse rounded-md bg-zinc-500/10" />
      ) : error ? (
        <p className="text-sm text-zinc-500">Indicateurs de visibilité momentanément indisponibles.</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Volume mensuel">
              {data.searchVolume != null ? (
                nf.format(data.searchVolume)
              ) : (
                <span className="text-zinc-400" title="Nécessite une source payante (DataForSEO/SEMrush)">
                  — <span className="text-xs">(source payante)</span>
                </span>
              )}
            </Stat>

            <Stat label="Concurrence (est.)">
              {data.competition ? (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-500/20">
                    <span
                      className={`block h-full ${LEVEL_BAR[data.competition.level]}`}
                      style={{ width: `${data.competition.score}%` }}
                    />
                  </span>
                  {LEVEL_LABEL[data.competition.level]}
                </span>
              ) : (
                <span className="text-zinc-400">Non évaluée</span>
              )}
            </Stat>

            <Stat label="Notoriété (Wikipédia)">
              {data.notoriety?.hasArticle ? (
                <a
                  href={data.notoriety.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  Article{" "}
                  {data.notoriety.monthlyViews != null && (
                    <span className="text-zinc-400">
                      ({nf.format(data.notoriety.monthlyViews)} vues/mois)
                    </span>
                  )}
                </a>
              ) : (
                <span className="text-zinc-400">Aucun article</span>
              )}
            </Stat>
          </div>

          {data.relatedTerms.length > 0 && (
            <div className="mt-4">
              <span className="text-xs text-zinc-500">Recherches associées</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {data.relatedTerms.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-zinc-400">
            Estimations à partir de sources gratuites (Google Suggest, Wikipédia). Volume précis et
            concurrents positionnés : sources payantes à venir.
          </p>
        </>
      ) : null}
    </section>
  );
}
