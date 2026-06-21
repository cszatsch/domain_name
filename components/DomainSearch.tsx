"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DomainRow, SortKey } from "@/components/types";
import type { PricingMap, SeoMetrics } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Filters } from "@/components/Filters";
import { SeoPanel } from "@/components/SeoPanel";
import { streamAvailability } from "@/lib/availability-client";
import { fetchPricing } from "@/lib/pricing-client";
import { fetchSeo } from "@/lib/seo-client";
import { buildDomains, isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { TLDS } from "@/lib/tlds";

function initialRows(label: string): DomainRow[] {
  return buildDomains(label, TLDS).map((domain, i) => ({
    domain,
    tld: TLDS[i].tld,
    category: TLDS[i].category,
  }));
}

const STATUS_RANK: Record<string, number> = { available: 0, unknown: 1, taken: 2 };
/** Rang de tri « disponibles d'abord » ; les domaines en cours passent en dernier. */
function availableRank(row: DomainRow): number {
  return row.result ? (STATUS_RANK[row.result.status] ?? 1) : 3;
}

export function DomainSearch() {
  const [label, setLabel] = useState("");
  const [rows, setRows] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [pricing, setPricing] = useState<PricingMap>({});
  const [currency, setCurrency] = useState("USD");
  const [pricingError, setPricingError] = useState(false);
  const [seo, setSeo] = useState<SeoMetrics | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const searchIdRef = useRef(0);

  // Tarifs : chargés une fois (cache serveur 24 h). Dégradation gracieuse en cas
  // d'indisponibilité : les cartes s'affichent sans prix + une note discrète.
  useEffect(() => {
    const controller = new AbortController();
    fetchPricing(controller.signal)
      .then((r) => {
        setPricing(r.prices);
        setCurrency(r.currency);
        setPricingError(false);
      })
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setPricingError(true);
        }
      });
    return () => controller.abort();
  }, []);

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
      setSeo(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLabel(normalized);
    setRows(initialRows(normalized));
    setLoading(true);

    // Visibilité / SEO en parallèle du streaming (searchId ignore les réponses obsolètes).
    const searchId = ++searchIdRef.current;
    setSeo(null);
    setSeoError(false);
    setSeoLoading(true);
    fetchSeo(normalized, controller.signal)
      .then((metrics) => {
        if (searchIdRef.current === searchId) setSeo(metrics);
      })
      .catch((err) => {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        if (searchIdRef.current === searchId && !aborted) setSeoError(true);
      })
      .finally(() => {
        if (searchIdRef.current === searchId) setSeoLoading(false);
      });

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

  const visibleRows = useMemo(() => {
    const filtered = availableOnly
      ? rows.filter((r) => r.result?.status === "available")
      : rows;
    if (sort === "default") return filtered;

    const sorted = [...filtered];
    if (sort === "available-first") {
      sorted.sort((a, b) => availableRank(a) - availableRank(b));
    } else {
      const key = sort === "reg-asc" ? "registration" : "renewal";
      sorted.sort((a, b) => {
        const pa = pricing[a.tld]?.[key];
        const pb = pricing[b.tld]?.[key];
        if (pa == null && pb == null) return 0;
        if (pa == null) return 1;
        if (pb == null) return -1;
        return pa - pb;
      });
    }
    return sorted;
  }, [rows, availableOnly, sort, pricing]);

  return (
    <div className="flex w-full flex-col gap-6">
      <SearchBar onSearch={search} loading={loading} onCancel={cancel} />

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {label && <SeoPanel term={label} data={seo} loading={seoLoading} error={seoError} />}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
            <Filters
              sort={sort}
              onSortChange={setSort}
              availableOnly={availableOnly}
              onAvailableOnlyChange={setAvailableOnly}
            />
          </div>

          <ResultsGrid rows={visibleRows} pricing={pricing} currency={currency} />

          {pricingError && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Prix temporairement indisponibles (source lente ou injoignable) — réessayez dans un
              instant.
            </p>
          )}

          <p className="text-xs text-zinc-400">
            Disponibilité indicative (RDAP/DNS) et tarifs indicatifs (Porkbun, en {currency}).
            Vérifiez toujours auprès d&apos;un registrar avant l&apos;achat — certains noms
            peuvent être premium ou réservés.
          </p>
        </>
      )}
    </div>
  );
}
