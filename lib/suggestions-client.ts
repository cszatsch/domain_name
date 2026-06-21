import type { SuggestionsResponse } from "@/lib/types";

/** Récupère les variantes suggérées depuis /api/suggestions (côté client). */
export async function fetchSuggestions(
  term: string,
  signal?: AbortSignal,
): Promise<SuggestionsResponse> {
  const res = await fetch(`/api/suggestions?term=${encodeURIComponent(term)}`, { signal });
  if (!res.ok) {
    throw new Error(`Suggestions indisponibles (${res.status}).`);
  }
  return (await res.json()) as SuggestionsResponse;
}
