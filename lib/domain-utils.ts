import type { Tld } from "@/lib/types";

/** Longueur maximale d'un label DNS. */
export const MAX_LABEL_LENGTH = 63;

/**
 * Normalise un terme saisi par l'utilisateur en un label DNS valide.
 *
 * - minuscules
 * - suppression des accents (café → cafe)
 * - espaces / underscores / points → tirets
 * - suppression des caractères non [a-z0-9-]
 * - tirets de début/fin et doublons supprimés
 * - tronqué à 63 caractères
 *
 * @returns le label normalisé, ou "" si rien d'exploitable.
 */
export function normalizeTerm(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacritiques (combining marks)
    .toLowerCase()
    .replace(/[\s_.]+/g, "-") // séparateurs → tiret
    .replace(/[^a-z0-9-]/g, "") // caractères invalides
    .replace(/-+/g, "-") // doublons de tirets
    .replace(/^-+|-+$/g, "") // tirets en bordure
    .slice(0, MAX_LABEL_LENGTH)
    .replace(/-+$/g, ""); // tiret de fin réapparu après le slice
}

/** Indique si un label normalisé est exploitable comme nom de domaine. */
export function isValidLabel(label: string): boolean {
  return label.length > 0 && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label);
}

/** Construit la liste de domaines `label.tld` à partir d'un label et des extensions. */
export function buildDomains(label: string, tlds: readonly Tld[]): string[] {
  return tlds.map((t) => `${label}.${t.tld}`);
}

/** Extrait l'extension (dernier label) d'un domaine. */
export function tldOf(domain: string): string {
  const idx = domain.lastIndexOf(".");
  return idx === -1 ? "" : domain.slice(idx + 1);
}
