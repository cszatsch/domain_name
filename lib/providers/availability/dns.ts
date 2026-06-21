import { resolveNs } from "node:dns/promises";

import type { AvailabilityResult } from "@/lib/types";
import { tldOf } from "@/lib/domain-utils";

/**
 * Heuristique DNS de repli, utilisée quand RDAP ne couvre pas le TLD.
 *
 * Présence d'enregistrements NS ⇒ le domaine est délégué donc "pris".
 * NXDOMAIN / ENOTFOUND ⇒ probablement libre (heuristique, pas une autorité
 * d'enregistrement : un domaine peut être réservé sans être délégué).
 * Toute autre erreur ⇒ indéterminé.
 */
export async function checkDns(domain: string): Promise<AvailabilityResult> {
  const tld = tldOf(domain);
  try {
    const records = await resolveNs(domain);
    return {
      domain,
      tld,
      status: records.length > 0 ? "taken" : "available",
      source: "dns",
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "NXDOMAIN") {
      return { domain, tld, status: "available", source: "dns" };
    }
    return {
      domain,
      tld,
      status: "unknown",
      source: "dns",
      error: code ?? (err instanceof Error ? err.message : "DNS lookup failed"),
    };
  }
}
