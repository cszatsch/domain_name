"use client";

import { motion } from "motion/react";
import { Check, X, HelpCircle, Loader2, type LucideIcon } from "lucide-react";

import type { AvailabilityStatus } from "@/lib/types";

type Status = AvailabilityStatus | "pending";

const MAP: Record<Status, { label: string; icon: LucideIcon; className: string; spin?: boolean }> = {
  available: {
    label: "Disponible",
    icon: Check,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  taken: {
    label: "Pris",
    icon: X,
    className: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
  unknown: {
    label: "Indéterminé",
    icon: HelpCircle,
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  pending: {
    label: "Vérification",
    icon: Loader2,
    className: "bg-slate-100 text-slate-500 ring-slate-400/20",
    spin: true,
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, icon: Icon, className, spin } = MAP[status];
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />
      {label}
    </motion.span>
  );
}
