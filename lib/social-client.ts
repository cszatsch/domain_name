import type { SocialResponse } from "@/lib/types";

/** Récupère la disponibilité réseaux sociaux depuis /api/social (côté client). */
export async function fetchSocial(term: string, signal?: AbortSignal): Promise<SocialResponse> {
  const res = await fetch(`/api/social?term=${encodeURIComponent(term)}`, { signal });
  if (!res.ok) {
    throw new Error(`Réseaux sociaux indisponibles (${res.status}).`);
  }
  return (await res.json()) as SocialResponse;
}
