"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { DomainRow } from "@/components/types";
import { SearchBar } from "@/components/SearchBar";
import { ResultsGrid } from "@/components/ResultsGrid";
import { streamAvailability } from "@/lib/availability-client";
import { buildDomains, isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { TLDS } from "@/lib/tlds";

function initialRows(label: string): DomainRow[] {
  return buildDomains(label, TLDS).map((domain, i) => ({
    domain,
    tld: TLDS[i].tld,
    category: TLDS[i].category,
  }));
}

export function DomainSearch() {
  const [label, setLabel] = useState("");
  const [rows, setRows] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const search = useCallback(async (term: string) => {
    const normalized = normalizeTerm(term);
    if (!isValidLabel(normalized)) {
      setError("Saisissez au moins une lettre ou un chiffre.");
      setRows([]);
      setLabel("");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLabel(normalized);
    setRows(initialRows(normalized));
    setLoading(true);

    try {
      await streamAvailability(normalized, {
        signal: controller.signal,
        onLine: (line) => {
          if (line.type === "result") {
            setRows((prev) =>
              prev.map((r) => (r.domain === line.domain ? { ...r, result: line } : r)),
            );
          } else if (line.type === "error") {
            setError(line.message);
          } else if (line.type === "done") {
            setLoading(false);
          }
        },
      });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError(err instanceof Error ? err.message : "Erreur réseau.");
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  const counts = useMemo(() => {
    let available = 0;
    let taken = 0;
    let pending = 0;
    for (const r of rows) {
      if (!r.result) pending++;
      else if (r.result.status === "available") available++;
      else if (r.result.status === "taken") taken++;
    }
    return { available, taken, pending };
  }, [rows]);

  const visibleRows = useMemo(
    () => (availableOnly ? rows.filter((r) => r.result?.status === "available") : rows),
    [rows, availableOnly],
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <SearchBar onSearch={search} loading={loading} onCancel={cancel} />

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="font-mono font-medium text-foreground">{label}</span> —{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                {counts.available} disponible{counts.available > 1 ? "s" : ""}
              </span>
              {" · "}
              <span>{counts.taken} pris</span>
              {counts.pending > 0 && (
                <>
                  {" · "}
                  <span className="text-zinc-500">{counts.pending} en cours</span>
                </>
              )}
            </p>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Disponibles uniquement
            </label>
          </div>

          <ResultsGrid rows={visibleRows} />

          <p className="text-xs text-zinc-400">
            Disponibilité indicative (RDAP/DNS). Vérifiez toujours auprès d&apos;un registrar
            avant l&apos;achat — certains noms peuvent être premium ou réservés.
          </p>
        </>
      )}
    </div>
  );
}
