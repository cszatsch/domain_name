"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, ExternalLink } from "lucide-react";

import type { DomainRow } from "@/components/types";
import type { TldPrice } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPrice } from "@/lib/format";

interface DomainCardProps {
  row: DomainRow;
  price?: TldPrice;
  currency: string;
  index?: number;
}

export function DomainCard({ row, price, currency, index = 0 }: DomainCardProps) {
  const status = row.result?.status ?? "pending";
  const available = status === "available";
  const [copied, setCopied] = useState(false);

  const reg = formatPrice(price?.registration, currency);
  const renew = formatPrice(price?.renewal, currency);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(row.domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // presse-papiers indisponible
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-white p-4 shadow-soft transition-shadow hover:shadow-lift ${
        available ? "border-emerald-200" : "border-black/[0.06]"
      }`}
    >
      {available && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      )}

      <div className="min-w-0">
        <p className="truncate font-mono text-[15px] font-medium text-slate-900">{row.domain}</p>
        {(reg || renew) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            {reg && (
              <span>
                Achat <span className="font-medium text-slate-600">{reg}</span>
              </span>
            )}
            {renew && (
              <span>
                · Renouv. <span className="font-medium text-slate-600">{renew}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <StatusBadge status={status} />

        {available && (
          <a
            href={`https://porkbun.com/checkout/search?q=${encodeURIComponent(row.domain)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Réserver ce domaine"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <button
          type="button"
          onClick={copy}
          aria-label={`Copier ${row.domain}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}
