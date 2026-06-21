import type { SeoMetrics } from "@/lib/types";

/** Récupère les indicateurs de visibilité depuis /api/seo (côté client). */
export async function fetchSeo(term: string, signal?: AbortSignal): Promise<SeoMetrics> {
  const res = await fetch(`/api/seo?term=${encodeURIComponent(term)}`, { signal });
  if (!res.ok) {
    throw new Error(`Visibilité indisponible (${res.status}).`);
  }
  return (await res.json()) as SeoMetrics;
}
