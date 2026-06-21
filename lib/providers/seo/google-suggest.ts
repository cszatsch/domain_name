// Google Suggest (autocomplétion) : gratuit, sans clé. Le client "firefox"
// renvoie un JSON [terme, [suggestions...]]. À appeler côté serveur (CORS).
const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";
const TIMEOUT_MS = 5000;
const MAX_TERMS = 8;

// Wikimedia/Google apprécient un User-Agent explicite.
export const SEO_USER_AGENT = "domain-name-app/0.1 (recherche de noms de domaine)";

/** Extrait la liste de suggestions du format brut (fonction pure, testable). */
export function parseSuggest(raw: unknown, max = MAX_TERMS): string[] {
  if (Array.isArray(raw) && Array.isArray(raw[1])) {
    return (raw[1] as unknown[]).filter((s): s is string => typeof s === "string").slice(0, max);
  }
  return [];
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  const url = `${SUGGEST_URL}?client=firefox&hl=fr&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": SEO_USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Google Suggest HTTP ${res.status}`);
  }
  return parseSuggest(await res.json());
}
