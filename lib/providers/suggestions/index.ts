import type { Suggestion } from "@/lib/types";

import { isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { pooledMap, withTimeout } from "@/lib/concurrency";
import { checkAvailability } from "@/lib/providers/availability";
import { fetchRelatedWords } from "@/lib/providers/suggestions/datamuse";
import { ruleBasedCandidates } from "@/lib/providers/suggestions/rules";

const MAX_SUGGESTIONS = 12;
const CONCURRENCY = 8;
const DOMAIN_DEADLINE_MS = 12000;
const SUGGESTION_TLD = "com";

const STATUS_RANK: Record<string, number> = { available: 0, unknown: 1, taken: 2 };

interface BuildOptions {
  max?: number;
  /** Labels à exclure (déjà proposés) — pour « Générer d'autres idées ». */
  exclude?: Iterable<string>;
  /** Mélange le pool pour varier les propositions. */
  shuffle?: boolean;
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Combine variantes sémantiques (Datamuse) et algorithmiques (règles), normalise,
 * dédoublonne, exclut le terme d'origine (et les labels déjà vus) puis plafonne.
 * Fonction pure (hors `shuffle` qui dépend de Math.random).
 */
export function buildCandidates(
  label: string,
  relatedWords: string[],
  { max = MAX_SUGGESTIONS, exclude, shuffle = false }: BuildOptions = {},
): string[] {
  const pool = [...relatedWords.map((w) => normalizeTerm(w)), ...ruleBasedCandidates(label)];
  const seen = new Set<string>([label, ...(exclude ?? [])]);
  const unique: string[] = [];
  for (const candidate of pool) {
    if (isValidLabel(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
      unique.push(candidate);
    }
  }
  return (shuffle ? shuffled(unique) : unique).slice(0, max);
}

export interface SuggestionProvider {
  generate(label: string, signal?: AbortSignal, options?: { exclude?: string[] }): Promise<Suggestion[]>;
}

/**
 * Provider de suggestions par défaut : Datamuse + règles, chaque variante étant
 * re-vérifiée en disponibilité sur `.com`. Tolérant aux pannes ; trie les
 * disponibles en premier. `exclude` + mélange alimentent la régénération.
 */
async function generateSuggestions(
  label: string,
  signal?: AbortSignal,
  options: { exclude?: string[] } = {},
): Promise<Suggestion[]> {
  const query = label.replace(/-/g, " ");
  const exclude = options.exclude ?? [];

  let related: string[] = [];
  try {
    related = await fetchRelatedWords(query);
  } catch {
    related = [];
  }

  const candidates = buildCandidates(label, related, { exclude, shuffle: exclude.length > 0 });
  const suggestions: Suggestion[] = new Array(candidates.length);

  await pooledMap(CONCURRENCY, candidates, async (candidate, index) => {
    const domain = `${candidate}.${SUGGESTION_TLD}`;
    const result = await withTimeout(checkAvailability(domain, signal), DOMAIN_DEADLINE_MS, {
      domain,
      tld: SUGGESTION_TLD,
      status: "unknown" as const,
      source: "rdap" as const,
    });
    suggestions[index] = { label: candidate, domain, status: result.status };
  });

  // Disponibles d'abord (tri stable : conserve l'ordre des candidats par ailleurs).
  return suggestions.sort((a, b) => (STATUS_RANK[a.status] ?? 1) - (STATUS_RANK[b.status] ?? 1));
}

export const suggestionProvider: SuggestionProvider = { generate: generateSuggestions };
