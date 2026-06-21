"use client";

import { useState } from "react";

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
    <form onSubmit={submit} className="flex w-full gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Un mot, une marque, un thème…"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
      />
      {loading ? (
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-xl bg-zinc-200 px-5 py-3 font-medium text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
        >
          Arrêter
        </button>
      ) : (
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Rechercher
        </button>
      )}
    </form>
  );
}
