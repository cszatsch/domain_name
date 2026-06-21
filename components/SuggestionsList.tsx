"use client";

import type { Suggestion } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

interface SuggestionsListProps {
  suggestions: Suggestion[];
  loading: boolean;
  error: boolean;
  onPick: (label: string) => void;
}

export function SuggestionsList({ suggestions, loading, error, onPick }: SuggestionsListProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Autres idées de noms</h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-500/10" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-zinc-500">Suggestions momentanément indisponibles.</p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune variante trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.domain}
              type="button"
              onClick={() => onPick(s.label)}
              title={`Rechercher « ${s.label} »`}
              className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-2.5 text-left transition hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
            >
              <span className="truncate font-mono text-sm">{s.domain}</span>
              <StatusBadge status={s.status} />
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-zinc-400">
        Disponibilité vérifiée sur .com. Cliquez sur une idée pour lancer une recherche complète.
      </p>
    </section>
  );
}
