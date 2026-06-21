import { isValidLabel, normalizeTerm } from "@/lib/domain-utils";
import { suggestionProvider } from "@/lib/providers/suggestions";

// Génère des variantes et vérifie leur disponibilité : runtime Node, non caché.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const term = normalizeTerm(params.get("term") ?? "");
  if (!isValidLabel(term)) {
    return Response.json({ error: "Terme invalide." }, { status: 422 });
  }

  const exclude = (params.get("exclude") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const suggestions = await suggestionProvider.generate(term, request.signal, { exclude });
  return Response.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
}
