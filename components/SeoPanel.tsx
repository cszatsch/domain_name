"use client";

import { motion } from "motion/react";
import { BarChart3, BookOpen, TrendingUp } from "lucide-react";

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

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{children}</span>
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
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        Potentiel de visibilité — <span className="font-mono normal-case text-slate-600">{term}</span>
      </h2>

      {loading ? (
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ) : error ? (
        <p className="text-sm text-slate-400">Indicateurs de visibilité momentanément indisponibles.</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Volume mensuel">
              {data.searchVolume != null ? (
                nf.format(data.searchVolume)
              ) : (
                <span className="font-normal text-slate-400" title="Nécessite une source payante (DataForSEO/SEMrush)">
                  — <span className="text-xs">source payante</span>
                </span>
              )}
            </Stat>

            <Stat icon={<BarChart3 className="h-3.5 w-3.5" />} label="Concurrence">
              {data.competition ? (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${data.competition.score}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`block h-full ${LEVEL_BAR[data.competition.level]}`}
                    />
                  </span>
                  {LEVEL_LABEL[data.competition.level]}
                </span>
              ) : (
                <span className="font-normal text-slate-400">Non évaluée</span>
              )}
            </Stat>

            <Stat icon={<BookOpen className="h-3.5 w-3.5" />} label="Notoriété">
              {data.notoriety?.hasArticle ? (
                <a
                  href={data.notoriety.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline-offset-2 hover:underline"
                >
                  Wikipédia
                  {data.notoriety.monthlyViews != null && (
                    <span className="font-normal text-slate-400">
                      {" "}
                      · {nf.format(data.notoriety.monthlyViews)}/mois
                    </span>
                  )}
                </a>
              ) : (
                <span className="font-normal text-slate-400">Aucun article</span>
              )}
            </Stat>
          </div>

          {data.relatedTerms.length > 0 && (
            <div className="mt-5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Recherches associées
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.relatedTerms.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-black/[0.05] bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Estimations à partir de sources gratuites (Google Suggest, Wikipédia). Volume précis et
            concurrents positionnés : sources payantes à venir.
          </p>
        </>
      ) : null}
    </section>
  );
}
