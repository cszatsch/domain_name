import type { SeoCompetition } from "@/lib/types";

interface CompetitionInput {
  /** Vues mensuelles Wikipédia (notoriété), si connues. */
  monthlyViews: number | null;
  /** Nombre de suggestions Google (activité de recherche). */
  relatedCount: number;
}

/**
 * Estime le niveau de concurrence d'un terme à partir de signaux gratuits.
 * Heuristique volontairement simple et étiquetée comme estimation :
 *  - notoriété Wikipédia (échelle log des vues) → jusqu'à 70 points ;
 *  - profondeur de l'autocomplétion Google → jusqu'à 30 points.
 * Renvoie null si aucun signal n'est disponible.
 */
export function computeCompetition({ monthlyViews, relatedCount }: CompetitionInput): SeoCompetition | null {
  const hasViews = monthlyViews != null && monthlyViews > 0;
  if (!hasViews && relatedCount === 0) return null;

  let score = 0;
  if (hasViews) {
    // log10(1 000 000) = 6 → 70 points (plafonné).
    score += Math.min(70, Math.round((Math.log10(monthlyViews) / 6) * 70));
  }
  score += Math.min(30, relatedCount * 4);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const level = score >= 66 ? "high" : score >= 33 ? "medium" : "low";
  return { score, level };
}
