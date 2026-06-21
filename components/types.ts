import type { AvailabilityResult, TldCategory } from "@/lib/types";

/** Ligne d'affichage : un domaine attendu + son résultat (quand il arrive). */
export interface DomainRow {
  domain: string;
  tld: string;
  category: TldCategory;
  result?: AvailabilityResult;
}
