"use client";

import { useState } from "react";

import type { DomainRow } from "@/components/types";
import { StatusBadge } from "@/components/StatusBadge";

export function DomainCard({ row }: { row: DomainRow }) {
  const status = row.result?.status ?? "pending";
  const available = status === "available";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(row.domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // presse-papiers indisponible : on ignore
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
        available
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium sm:text-base">{row.domain}</p>
        {row.result?.source && (
          <p className="mt-0.5 text-xs text-zinc-500">via {row.result.source.toUpperCase()}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={status} />
        <button
          type="button"
          onClick={copy}
          aria-label={`Copier ${row.domain}`}
          className="rounded-md px-2 py-1 text-xs text-zinc-500 ring-1 ring-inset ring-black/10 transition hover:bg-black/5 dark:ring-white/15 dark:hover:bg-white/10"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}
