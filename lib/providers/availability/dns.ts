import { Resolver } from "node:dns/promises";

import type { AvailabilityResult } from "@/lib/types";
import { tldOf } from "@/lib/domain-utils";

// Resolver borné : sans timeout explicite, une résolution lente peut traîner
// (plusieurs essais × ~5 s) et laisser une carte bloquée en « Vérification ».
const DNS_TIMEOUT_MS = 4000;
const resolver = new Resolver({ timeout: DNS_TIMEOUT_MS, tries: 1 });

// Codes signifiant « le domaine n'est pas délégué » → probablement libre.
const FREE_CODES = new Set(["ENOTFOUND", "ENODATA", "NXDOMAIN"]);

/**
 * Heuristique DNS de repli, utilisée quand RDAP ne couvre pas le TLD ou échoue.
 *
 * Présence d'enregistrements NS ⇒ domaine délégué donc "pris".
 * NXDOMAIN / ENOTFOUND ⇒ probablement libre (heuristique, pas une autorité
 * d'enregistrement). Timeout / autre erreur ⇒ indéterminé.
 */
export async function checkDns(domain: string): Promise<AvailabilityResult> {
  const tld = tldOf(domain);
  try {
    const records = await resolver.resolveNs(domain);
    return {
      domain,
      tld,
      status: records.length > 0 ? "taken" : "available",
      source: "dns",
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code && FREE_CODES.has(code)) {
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
