import type { PricingMap } from "@/lib/types";

import { fetchPorkbunPricing } from "@/lib/providers/pricing/porkbun";

export interface PricingProvider {
  /** Devise des montants renvoyés (ex. "USD"). */
  readonly currency: string;
  /** Récupère les tarifs de toutes les extensions connues du registrar. */
  getAll(): Promise<PricingMap>;
}

/**
 * Provider de tarifs par défaut (Porkbun, gratuit).
 * Remplaçable par un comparateur multi-registrars (cf. plan, Phase 2+).
 */
export const pricingProvider: PricingProvider = {
  currency: "USD",
  getAll: fetchPorkbunPricing,
};
