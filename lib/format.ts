/** Formate un montant dans la devise donnée (locale fr-FR), ou null si absent. */
export function formatPrice(
  value: number | null | undefined,
  currency: string,
): string | null {
  if (value == null) return null;
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
  } catch {
    // Code devise invalide : repli simple.
    return `${value.toFixed(2)} ${currency}`;
  }
}
