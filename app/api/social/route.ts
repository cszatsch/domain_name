import { isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { checkSocial, toHandle } from "@/lib/providers/social";

// Sonde des plateformes externes : runtime Node, non caché.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request): Promise<Response> {
  const term = normalizeTerm(new URL(request.url).searchParams.get("term") ?? "");
  if (!isValidLabel(term)) {
    return Response.json({ error: "Terme invalide." }, { status: 422 });
  }

  const results = await checkSocial(term, request.signal);
  return Response.json(
    { handle: toHandle(term), results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
