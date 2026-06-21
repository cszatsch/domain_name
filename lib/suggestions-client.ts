import type { SuggestionsResponse } from "@/lib/types";

/**
 * Récupère les variantes suggérées depuis /api/suggestions (côté client).
 * `exclude` permet d'obtenir de nouvelles idées (bouton « Générer d'autres idées »).
 */
export async function fetchSuggestions(
  term: string,
  signal?: AbortSignal,
  exclude?: string[],
): Promise<SuggestionsResponse> {
  const params = new URLSearchParams({ term });
  if (exclude && exclude.length > 0) params.set("exclude", exclude.join(","));

  const res = await fetch(`/api/suggestions?${params.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`Suggestions indisponibles (${res.status}).`);
  }
  return (await res.json()) as SuggestionsResponse;
}
