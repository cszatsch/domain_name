"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Search, Square } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  loading: boolean;
  onCancel: () => void;
}

export function SearchBar({ onSearch, loading, onCancel }: SearchBarProps) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={submit} className="flex w-full items-stretch gap-2.5">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Un mot, une marque, un thème…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-black/[0.07] bg-white py-4 pl-12 pr-4 text-base text-slate-900 shadow-soft outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:shadow-lift focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {loading ? (
        <motion.button
          type="button"
          onClick={onCancel}
          whileTap={{ scale: 0.97 }}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-black/[0.07] bg-white px-5 font-medium text-slate-700 shadow-soft transition hover:bg-slate-50"
        >
          <Square className="h-4 w-4 fill-current" />
          Arrêter
        </motion.button>
      ) : (
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="shrink-0 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-6 font-medium text-white shadow-[0_4px_16px_-4px_rgba(99,102,241,0.6)] transition hover:from-indigo-500 hover:to-indigo-700"
        >
          Rechercher
        </motion.button>
      )}
    </form>
  );
}
