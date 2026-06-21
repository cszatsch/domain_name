import type { PricingMap } from "@/lib/types";

// Endpoint public Porkbun (aucune authentification requise pour les tarifs).
// Convention de l'API : POST avec un corps JSON.
const PORKBUN_PRICING_URL = "https://api.porkbun.com/api/json/v3/pricing/get";
const TIMEOUT_MS = 8000;

interface RawTldPricing {
  registration?: string;
  renewal?: string;
  transfer?: string;
}

export interface RawPorkbunPricing {
  status: string;
  pricing: Record<string, RawTldPricing>;
}

function toNumber(value: string | undefined): number | null {
  if (value == null) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/** Transforme la réponse brute Porkbun en table de tarifs (fonction pure, testable). */
export function parsePorkbunPricing(raw: RawPorkbunPricing): PricingMap {
  if (raw?.status !== "SUCCESS" || !raw.pricing || typeof raw.pricing !== "object") {
    throw new Error("Réponse Porkbun invalide.");
  }

  const out: PricingMap = {};
  for (const [tld, p] of Object.entries(raw.pricing)) {
    if (!p || typeof p !== "object") continue;
    out[tld.toLowerCase()] = {
      tld: tld.toLowerCase(),
      registration: toNumber(p.registration),
      renewal: toNumber(p.renewal),
      transfer: toNumber(p.transfer),
    };
  }
  return out;
}

export async function fetchPorkbunPricing(): Promise<PricingMap> {
  const res = await fetch(PORKBUN_PRICING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Porkbun HTTP ${res.status}`);
  }
  const raw = (await res.json()) as RawPorkbunPricing;
  return parsePorkbunPricing(raw);
}
