// Datamuse : API gratuite et sans clé de mots proches/associés.
// https://api.datamuse.com/words?ml=TERM (means-like)
const DATAMUSE_URL = "https://api.datamuse.com/words";
const TIMEOUT_MS = 5000;
const MAX_WORDS = 10;

/** Extrait la liste de mots du format Datamuse [{word, score}, ...] (pure). */
export function parseDatamuse(raw: unknown, max = MAX_WORDS): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) =>
      item && typeof item === "object" ? (item as { word?: unknown }).word : undefined,
    )
    .filter((word): word is string => typeof word === "string")
    .slice(0, max);
}

export async function fetchRelatedWords(query: string): Promise<string[]> {
  const url = `${DATAMUSE_URL}?ml=${encodeURIComponent(query)}&max=${MAX_WORDS}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Datamuse HTTP ${res.status}`);
  }
  return parseDatamuse(await res.json());
}
