"use client";

import { motion } from "motion/react";
import { AtSign, Camera, Code2, MessageCircle, Music2, Play, type LucideIcon } from "lucide-react";

import type { AvailabilityStatus, SocialResult } from "@/lib/types";

// lucide a retiré les icônes de marque : on utilise des icônes thématiques.
const ICONS: Record<string, LucideIcon> = {
  github: Code2,
  instagram: Camera,
  x: MessageCircle,
  tiktok: Music2,
  youtube: Play,
};

const STATUS: Record<AvailabilityStatus, { label: string; dot: string; text: string }> = {
  available: { label: "Libre", dot: "bg-emerald-500", text: "text-emerald-600" },
  taken: { label: "Pris", dot: "bg-rose-500", text: "text-rose-600" },
  unknown: { label: "?", dot: "bg-slate-300", text: "text-slate-400" },
};

interface SocialRowProps {
  handle: string;
  results: SocialResult[];
  loading: boolean;
  error: boolean;
}

export function SocialRow({ handle, results, loading, error }: SocialRowProps) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        Réseaux sociaux — <span className="font-mono normal-case text-slate-600">@{handle}</span>
      </h2>

      {loading ? (
        <div className="h-9 animate-pulse rounded-xl bg-slate-100" />
      ) : error ? (
        <p className="text-sm text-slate-400">Vérification réseaux sociaux indisponible.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {results.map((r, i) => {
            const Icon = ICONS[r.platform] ?? AtSign;
            const s = STATUS[r.status];
            return (
              <motion.a
                key={r.platform}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3 py-1.5 text-sm text-slate-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {r.name}
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                </span>
              </motion.a>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Indicatif : certaines plateformes bloquent la vérification automatique (statut « ? »).
      </p>
    </section>
  );
}
