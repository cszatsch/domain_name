import type { Tld, TldCategory } from "@/lib/types";

/**
 * Liste curatée des extensions proposées par défaut.
 * Source de vérité partagée entre l'UI (squelettes) et le serveur (vérifications),
 * pour garantir que les deux raisonnent sur le même ensemble de domaines.
 */
export const TLDS: readonly Tld[] = [
  // Génériques
  { tld: "com", category: "generic", popular: true },
  { tld: "net", category: "generic", popular: true },
  { tld: "org", category: "generic", popular: true },
  { tld: "info", category: "generic" },
  { tld: "biz", category: "generic" },
  // Tech / startup
  { tld: "io", category: "tech", popular: true },
  { tld: "ai", category: "tech", popular: true },
  { tld: "app", category: "tech", popular: true },
  { tld: "dev", category: "tech" },
  { tld: "tech", category: "tech" },
  { tld: "xyz", category: "tech" },
  { tld: "co", category: "tech", popular: true },
  // Géographiques
  { tld: "fr", category: "geo", popular: true },
  { tld: "eu", category: "geo" },
  { tld: "me", category: "geo" },
  // Business
  { tld: "shop", category: "business" },
  { tld: "store", category: "business" },
  { tld: "online", category: "business" },
] as const;

export const TLD_CATEGORY_LABELS: Record<TldCategory, string> = {
  generic: "Génériques",
  tech: "Tech / startup",
  geo: "Géographiques",
  business: "Business",
};

/** Ensemble des extensions valides (pour validation rapide). */
export const VALID_TLDS: ReadonlySet<string> = new Set(TLDS.map((t) => t.tld));
