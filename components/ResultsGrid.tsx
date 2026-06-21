import type { DomainRow } from "@/components/types";
import type { PricingMap } from "@/lib/types";
import { DomainCard } from "@/components/DomainCard";

interface ResultsGridProps {
  rows: DomainRow[];
  pricing: PricingMap;
  currency: string;
}

export function ResultsGrid({ rows, pricing, currency }: ResultsGridProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/[0.08] bg-white/50 py-10 text-center text-sm text-slate-400">
        Aucun domaine ne correspond au filtre.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((row, i) => (
        <DomainCard key={row.domain} row={row} price={pricing[row.tld]} currency={currency} index={i} />
      ))}
    </div>
  );
}
