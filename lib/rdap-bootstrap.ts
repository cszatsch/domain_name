import { getOrSet } from "@/lib/cache";

// Le registre "bootstrap" de l'IANA associe chaque TLD à son serveur RDAP.
// https://datatracker.ietf.org/doc/html/rfc7484
const IANA_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const BOOTSTRAP_FETCH_TIMEOUT_MS = 8000;

interface IanaBootstrap {
  // [ [ [tld, ...], [url, ...] ], ... ]
  services: [string[], string[]][];
}

/** Construit la table TLD → URL de base RDAP à partir du registre IANA. */
function buildMap(data: IanaBootstrap): Map<string, string> {
  const map = new Map<string, string>();
  for (const [tlds, urls] of data.services) {
    // On privilégie une URL https et on normalise le slash final.
    const base = (urls.find((u) => u.startsWith("https://")) ?? urls[0])?.replace(/\/?$/, "/");
    if (!base) continue;
    for (const tld of tlds) {
      map.set(tld.toLowerCase(), base);
    }
  }
  return map;
}

async function loadBootstrap(): Promise<Map<string, string>> {
  return getOrSet("iana-rdap-bootstrap", BOOTSTRAP_TTL_MS, async () => {
    const res = await fetch(IANA_BOOTSTRAP_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(BOOTSTRAP_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`IANA bootstrap HTTP ${res.status}`);
    }
    const data = (await res.json()) as IanaBootstrap;
    return buildMap(data);
  });
}

/**
 * Retourne l'URL de base du serveur RDAP pour un TLD, ou null si non couvert
 * (ou si le registre est temporairement injoignable).
 */
export async function getRdapBase(tld: string): Promise<string | null> {
  try {
    const map = await loadBootstrap();
    return map.get(tld.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}
