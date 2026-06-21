"use client";

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
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-zinc-500">Trier :</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 outline-none focus:border-zinc-400 dark:border-white/15 dark:bg-zinc-900"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex cursor-pointer items-center gap-2 select-none">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          className="h-4 w-4 accent-emerald-600"
        />
        Disponibles uniquement
      </label>
    </div>
  );
}
