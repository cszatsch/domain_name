// Types partagés entre le serveur (route handlers, providers) et le client (UI).

export type TldCategory = "generic" | "tech" | "geo" | "business";

export interface Tld {
  /** Extension sans le point initial, ex. "com", "fr", "io". */
  tld: string;
  category: TldCategory;
  /** Mis en avant par défaut dans l'UI. */
  popular?: boolean;
}

/**
 * Statut de disponibilité d'un domaine.
 * - available : aucun enregistrement trouvé (probablement libre)
 * - taken     : enregistrement existant
 * - unknown   : impossible de déterminer (timeout, erreur amont, TLD non couvert)
 */
export type AvailabilityStatus = "available" | "taken" | "unknown";

/** Source ayant produit le verdict de disponibilité. */
export type AvailabilitySource = "rdap" | "dns";

export interface AvailabilityResult {
  domain: string;
  tld: string;
  status: AvailabilityStatus;
  source: AvailabilitySource;
  /** Message d'erreur éventuel (debug), présent quand status = "unknown". */
  error?: string;
}

/** Ligne émise par le flux NDJSON de /api/availability. */
export type AvailabilityStreamLine =
  | ({ type: "result" } & AvailabilityResult)
  | { type: "error"; message: string }
  | { type: "done"; total: number };

/** Tarifs d'une extension (montants dans la devise de la réponse). */
export interface TldPrice {
  tld: string;
  /** Prix d'acquisition (1re année), ou null si inconnu. */
  registration: number | null;
  /** Prix de renouvellement annuel, ou null si inconnu. */
  renewal: number | null;
  /** Prix de transfert, ou null si inconnu. */
  transfer: number | null;
}

/** Table extension → tarifs. */
export type PricingMap = Record<string, TldPrice>;

/** Réponse de /api/pricing. */
export interface PricingResponse {
  currency: string;
  prices: PricingMap;
}
