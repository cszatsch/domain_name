"use client";

import type { AvailabilityStatus, SocialResult } from "@/lib/types";

const STATUS: Record<AvailabilityStatus, { label: string; className: string }> = {
  available: { label: "Libre", className: "text-emerald-600 dark:text-emerald-400" },
  taken: { label: "Pris", className: "text-rose-600 dark:text-rose-400" },
  unknown: { label: "?", className: "text-zinc-400" },
};

interface SocialRowProps {
  handle: string;
  results: SocialResult[];
  loading: boolean;
  error: boolean;
}

export function SocialRow({ handle, results, loading, error }: SocialRowProps) {
  return (
    <section className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <h2 className="mb-3 text-sm font-semibold">
        Réseaux sociaux — <span className="font-mono">@{handle}</span>
      </h2>

      {loading ? (
        <div className="h-8 animate-pulse rounded-md bg-zinc-500/10" />
      ) : error ? (
        <p className="text-sm text-zinc-500">Vérification réseaux sociaux indisponible.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {results.map((r) => {
            const s = STATUS[r.status];
            return (
              <a
                key={r.platform}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              >
                <span>{r.name}</span>
                <span className={`text-xs font-medium ${s.className}`}>{s.label}</span>
              </a>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-xs text-zinc-400">
        Indicatif : certaines plateformes bloquent la vérification automatique (statut « ? »).
      </p>
    </section>
  );
}
