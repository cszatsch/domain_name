import type { AvailabilityResult, AvailabilityStatus } from "@/lib/types";
import { tldOf } from "@/lib/domain-utils";
import { getRdapBase } from "@/lib/rdap-bootstrap";

const RDAP_TIMEOUT_MS = 5000;

/**
 * Traduit un code HTTP RDAP en statut de disponibilité.
 * - 404 → libre (aucun objet domaine enregistré)
 * - 200 → pris
 * - 429 / autres → indéterminé
 */
export function interpretRdapStatus(httpStatus: number): AvailabilityStatus {
  if (httpStatus === 404) return "available";
  if (httpStatus === 200) return "taken";
  return "unknown";
}

/**
 * Vérifie la disponibilité d'un domaine via RDAP.
 * Retourne `null` si le TLD n'est pas couvert par le registre RDAP, afin de
 * laisser l'orchestrateur tenter un fallback.
 */
export async function checkRdap(
  domain: string,
  signal?: AbortSignal,
): Promise<AvailabilityResult | null> {
  const tld = tldOf(domain);
  const base = await getRdapBase(tld);
  if (!base) return null;

  const url = `${base}domain/${encodeURIComponent(domain)}`;
  const timeout = AbortSignal.timeout(RDAP_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/rdap+json" },
      redirect: "follow",
      signal: combined,
    });
    return {
      domain,
      tld,
      status: interpretRdapStatus(res.status),
      source: "rdap",
      ...(interpretRdapStatus(res.status) === "unknown"
        ? { error: `RDAP HTTP ${res.status}` }
        : {}),
    };
  } catch (err) {
    return {
      domain,
      tld,
      status: "unknown",
      source: "rdap",
      error: err instanceof Error ? err.message : "RDAP fetch failed",
    };
  }
}
