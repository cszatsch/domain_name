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

/**
 * Combine variantes sémantiques (Datamuse) et algorithmiques (règles), normalise,
 * dédoublonne, exclut le terme d'origine et plafonne la liste. Fonction pure.
 */
export function buildCandidates(label: string, relatedWords: string[], max = MAX_SUGGESTIONS): string[] {
  const candidates = [...relatedWords.map((w) => normalizeTerm(w)), ...ruleBasedCandidates(label)];
  const seen = new Set<string>([label]); // exclut le terme recherché
  const out: string[] = [];
  for (const candidate of candidates) {
    if (isValidLabel(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
      if (out.length >= max) break;
    }
  }
  return out;
}

export interface SuggestionProvider {
  generate(label: string, signal?: AbortSignal): Promise<Suggestion[]>;
}

/**
 * Provider de suggestions par défaut : Datamuse + règles, chaque variante étant
 * re-vérifiée en disponibilité sur `.com`. Tolérant aux pannes ; trie les
 * disponibles en premier. Extensible (option LLM via cette interface).
 */
async function generateSuggestions(label: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const query = label.replace(/-/g, " ");

  let related: string[] = [];
  try {
    related = await fetchRelatedWords(query);
  } catch {
    related = [];
  }

  const candidates = buildCandidates(label, related);
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
