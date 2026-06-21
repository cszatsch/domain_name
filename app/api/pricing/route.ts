import { unstable_cache } from "next/cache";

import { pricingProvider } from "@/lib/providers/pricing";

export const runtime = "nodejs";

const PRICING_REVALIDATE_S = 24 * 60 * 60; // 24 h

// Cache persistant via le Data Cache de Next : survit au rechargement des
// modules en dev (sur disque) et est partagé entre instances en prod. Les rejets
// (timeout, 5xx amont) ne sont PAS mis en cache : un appel suivant retentera.
//
// NB : `unstable_cache` reste supporté en Next 16. La bascule vers `use cache`
// nécessiterait d'activer Cache Components au niveau de l'app (Phase 5).
const getCachedPricing = unstable_cache(() => pricingProvider.getAll(), ["pricing", "porkbun"], {
  revalidate: PRICING_REVALIDATE_S,
  tags: ["pricing"],
});

export async function GET(): Promise<Response> {
  try {
    const prices = await getCachedPricing();
    return Response.json(
      { currency: pricingProvider.currency, prices },
      {
        headers: {
          // Mutualisation côté CDN/navigateur (les tarifs évoluent peu).
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return Response.json({ error: "Tarifs temporairement indisponibles." }, { status: 502 });
  }
}
