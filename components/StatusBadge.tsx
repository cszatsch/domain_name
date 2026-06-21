import type { AvailabilityStatus } from "@/lib/types";

const STYLES: Record<AvailabilityStatus | "pending", { label: string; className: string }> = {
  available: {
    label: "Disponible",
    className:
      "bg-emerald-500/15 text-emerald-700 ring-emerald-600/30 dark:text-emerald-300",
  },
  taken: {
    label: "Pris",
    className: "bg-rose-500/15 text-rose-700 ring-rose-600/30 dark:text-rose-300",
  },
  unknown: {
    label: "Indéterminé",
    className: "bg-amber-500/15 text-amber-700 ring-amber-600/30 dark:text-amber-300",
  },
  pending: {
    label: "Vérification…",
    className:
      "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20 dark:text-zinc-400 animate-pulse",
  },
};

export function StatusBadge({ status }: { status: AvailabilityStatus | "pending" }) {
  const { label, className } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
