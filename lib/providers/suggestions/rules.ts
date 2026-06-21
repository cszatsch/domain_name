// Génération de variantes par règles (pure, sans réseau) : préfixes, suffixes,
// pluriel. Complète les suggestions sémantiques (Datamuse). Liste volontairement
// large pour alimenter le bouton « Générer d'autres idées ».

const PREFIXES = ["get", "try", "use", "my", "go", "the", "join", "hey", "with", "on"];
const SUFFIXES = ["app", "hq", "hub", "ify", "now", "ly", "io", "labs", "kit", "spot", "pro"];

/** Variantes algorithmiques d'un label (ordre déterministe). */
export function ruleBasedCandidates(label: string): string[] {
  const out: string[] = [];
  for (const prefix of PREFIXES) out.push(`${prefix}${label}`);
  for (const suffix of SUFFIXES) out.push(`${label}${suffix}`);
  out.push(`${label}s`); // pluriel naïf
  return out;
}
