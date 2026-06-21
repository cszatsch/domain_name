import { unstable_cache } from "next/cache";

import { isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { seoProvider } from "@/lib/providers/seo";

export const runtime = "nodejs";

const SEO_REVALIDATE_S = 24 * 60 * 60; // 24 h

function getCachedMetrics(term: string) {
  return unstable_cache(() => seoProvider.getMetrics(term), ["seo", seoProvider.name, term], {
    revalidate: SEO_REVALIDATE_S,
    tags: ["seo"],
  })();
}

export async function GET(request: Request): Promise<Response> {
  const term = normalizeTerm(new URL(request.url).searchParams.get("term") ?? "");
  if (!isValidLabel(term)) {
    return Response.json({ error: "Terme invalide." }, { status: 422 });
  }

  try {
    const metrics = await getCachedMetrics(term);
    return Response.json(metrics, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json({ error: "Données de visibilité indisponibles." }, { status: 502 });
  }
}
