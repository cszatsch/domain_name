import { getOrSet } from "@/lib/cache";
import { pricingProvider } from "@/lib/providers/pricing";

export const runtime = "nodejs";

const PRICING_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const PRICING_CACHE_KEY = "pricing:porkbun";

export async function GET(): Promise<Response> {
  try {
    const prices = await getOrSet(PRICING_CACHE_KEY, PRICING_TTL_MS, () =>
      pricingProvider.getAll(),
    );
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
