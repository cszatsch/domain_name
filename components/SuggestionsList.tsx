"use client";

import { motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";

import type { Suggestion } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

interface SuggestionsListProps {
  suggestions: Suggestion[];
  loading: boolean;
  error: boolean;
  moreLoading: boolean;
  onPick: (label: string) => void;
  onMore: () => void;
}

export function SuggestionsList({
  suggestions,
  loading,
  error,
  moreLoading,
  onPick,
  onMore,
}: SuggestionsListProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        Autres idées de noms
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-slate-400">Suggestions momentanément indisponibles.</p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-slate-400">Aucune variante trouvée.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s.domain}
                type="button"
                onClick={() => onPick(s.label)}
                title={`Rechercher « ${s.label} »`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.25) }}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-left shadow-soft transition-shadow hover:shadow-lift"
              >
                <span className="truncate font-mono text-sm text-slate-900">{s.domain}</span>
                <StatusBadge status={s.status} />
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <motion.button
              type="button"
              onClick={onMore}
              disabled={moreLoading}
              whileHover={{ scale: moreLoading ? 1 : 1.02 }}
              whileTap={{ scale: moreLoading ? 1 : 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 shadow-soft transition hover:bg-indigo-100 disabled:opacity-60"
            >
              {moreLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Générer d&apos;autres idées
            </motion.button>
          </div>
        </>
      )}

      <p className="mt-3 text-center text-xs text-slate-400">
        Disponibilité vérifiée sur .com. Cliquez sur une idée pour lancer une recherche complète.
      </p>
    </section>
  );
}
