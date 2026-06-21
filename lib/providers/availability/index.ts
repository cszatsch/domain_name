import type { AvailabilityResult } from "@/lib/types";

import { checkRdap } from "@/lib/providers/availability/rdap";
import { checkDns } from "@/lib/providers/availability/dns";

export interface AvailabilityProvider {
  check(domain: string, signal?: AbortSignal): Promise<AvailabilityResult>;
}

/**
 * Orchestrateur de disponibilité (stratégie hybride) :
 * 1. RDAP (source autoritative, gratuite) ;
 * 2. repli heuristique DNS si le TLD n'est pas couvert par RDAP, ou si RDAP
 *    renvoie un résultat indéterminé.
 *
 * Conçu pour être étendu (WHOIS, API registrar) sans toucher à l'appelant.
 */
export async function checkAvailability(
  domain: string,
  signal?: AbortSignal,
): Promise<AvailabilityResult> {
  const rdap = await checkRdap(domain, signal);
  if (rdap && rdap.status !== "unknown") {
    return rdap;
  }

  // RDAP indisponible (TLD non couvert) ou indéterminé : on tente le DNS.
  const dns = await checkDns(domain);
  if (dns.status !== "unknown") {
    return dns;
  }

  // Aucun verdict fiable : on renvoie le résultat RDAP s'il existait, sinon DNS.
  return rdap ?? dns;
}
