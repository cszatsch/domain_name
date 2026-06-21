import type { PricingResponse } from "@/lib/types";

/** Récupère les tarifs depuis /api/pricing (côté client). */
export async function fetchPricing(signal?: AbortSignal): Promise<PricingResponse> {
  const res = await fetch("/api/pricing", { signal });
  if (!res.ok) {
    throw new Error(`Tarifs indisponibles (${res.status}).`);
  }
  return (await res.json()) as PricingResponse;
}
