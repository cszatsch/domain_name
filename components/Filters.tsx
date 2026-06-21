"use client";

import { ChevronDown } from "lucide-react";

import type { SortKey } from "@/components/types";

interface FiltersProps {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Ordre par défaut" },
  { value: "reg-asc", label: "Prix d'achat ↑" },
  { value: "renew-asc", label: "Renouvellement ↑" },
  { value: "available-first", label: "Disponibles d'abord" },
];

export function Filters({
  sort,
  onSortChange,
  availableOnly,
  onAvailableOnlyChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          aria-label="Trier les résultats"
          className="appearance-none rounded-xl border border-black/[0.07] bg-white py-2 pl-3 pr-9 text-slate-700 shadow-soft outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={availableOnly}
        onClick={() => onAvailableOnlyChange(!availableOnly)}
        className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white py-2 pl-3 pr-3.5 text-slate-700 shadow-soft transition hover:bg-slate-50"
      >
        <span
          className={`relative h-4 w-7 rounded-full transition-colors ${
            availableOnly ? "bg-indigo-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
              availableOnly ? "left-3.5" : "left-0.5"
            }`}
          />
        </span>
        Disponibles
      </button>
    </div>
  );
}
