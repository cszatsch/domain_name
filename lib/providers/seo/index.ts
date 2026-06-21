import type { SeoMetrics } from "@/lib/types";

import { fetchSuggestions } from "@/lib/providers/seo/google-suggest";
import { fetchNotoriety } from "@/lib/providers/seo/wikipedia";
import { computeCompetition } from "@/lib/providers/seo/competition";

export interface SeoProvider {
  readonly name: string;
  getMetrics(term: string): Promise<SeoMetrics>;
}

/**
 * Provider SEO gratuit par défaut : agrège Google Suggest (termes associés) et
 * Wikipédia (notoriété), puis en déduit une estimation de concurrence.
 *
 * Tolérant aux pannes (Promise.allSettled) : une source indisponible n'empêche
 * pas le reste de remonter. Le volume de recherche absolu reste null (nécessite
 * une source payante — DataForSEO/SEMrush — branchable via cette interface).
 */
async function getFreeMetrics(term: string): Promise<SeoMetrics> {
  // Les tirets du label deviennent des espaces pour interroger Suggest/Wikipédia.
  const query = term.replace(/-/g, " ");

  const [suggest, notorietyResult] = await Promise.allSettled([
    fetchSuggestions(query),
    fetchNotoriety(query),
  ]);

  const relatedTerms = suggest.status === "fulfilled" ? suggest.value : [];
  const notoriety = notorietyResult.status === "fulfilled" ? notorietyResult.value : null;

  const sources: string[] = [];
  if (suggest.status === "fulfilled") sources.push("google-suggest");
  if (notorietyResult.status === "fulfilled") sources.push("wikipedia");

  const competition = computeCompetition({
    monthlyViews: notoriety?.monthlyViews ?? null,
    relatedCount: relatedTerms.length,
  });

  return {
    term,
    searchVolume: null,
    competition,
    relatedTerms,
    notoriety,
    sources,
    estimated: true,
  };
}

export const seoProvider: SeoProvider = {
  name: "free",
  getMetrics: getFreeMetrics,
};
