import type { PricingResponse } from "@/lib/types";

const RETRY_DELAY_MS = 1500;

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/**
 * Récupère les tarifs depuis /api/pricing (côté client), avec un retry léger :
 * l'endpoint amont peut être lent (502 ponctuel), un second essai suffit souvent
 * une fois le cache serveur amorcé.
 */
export async function fetchPricing(
  signal?: AbortSignal,
  attempts = 2,
): Promise<PricingResponse> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    try {
      const res = await fetch("/api/pricing", { signal });
      if (res.ok) {
        return (await res.json()) as PricingResponse;
      }
      lastError = new Error(`Tarifs indisponibles (${res.status}).`);
    } catch (err) {
      if (isAbort(err)) throw err;
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Tarifs indisponibles.");
}
