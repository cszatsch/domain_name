import type { DomainRow } from "@/components/types";
import { DomainCard } from "@/components/DomainCard";

export function ResultsGrid({ rows }: { rows: DomainRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        Aucun domaine ne correspond au filtre.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <DomainCard key={row.domain} row={row} />
      ))}
    </div>
  );
}
