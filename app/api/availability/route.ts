import type { AvailabilityStreamLine } from "@/lib/types";
import { buildDomains, isValidLabel, normalizeTerm, tldOf } from "@/lib/domain-utils";
import { TLDS } from "@/lib/tlds";
import { pooledMap, withTimeout } from "@/lib/concurrency";
import { checkAvailability } from "@/lib/providers/availability";

// Appels réseau vers des hôtes RDAP variés + streaming : runtime Node requis.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CONCURRENCY = 8;
// Garde-fou : un domaine doit toujours aboutir à un état (jamais bloqué).
// RDAP (~5 s) + DNS (~4 s) au pire ; au-delà on renvoie « indéterminé ».
const DOMAIN_DEADLINE_MS = 12000;

export async function POST(request: Request): Promise<Response> {
  let term: unknown;
  try {
    ({ term } = await request.json());
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (typeof term !== "string") {
    return Response.json({ error: "Le champ « term » est requis." }, { status: 400 });
  }

  const label = normalizeTerm(term);
  if (!isValidLabel(label)) {
    return Response.json(
      { error: "Terme invalide après normalisation (lettres/chiffres requis)." },
      { status: 422 },
    );
  }

  const domains = buildDomains(label, TLDS);
  const encoder = new TextEncoder();

  const write = (controller: ReadableStreamDefaultController, line: AvailabilityStreamLine) =>
    controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await pooledMap(CONCURRENCY, domains, async (domain) => {
          const result = await withTimeout(
            checkAvailability(domain, request.signal),
            DOMAIN_DEADLINE_MS,
            { domain, tld: tldOf(domain), status: "unknown", source: "rdap", error: "timeout" },
          );
          write(controller, { type: "result", ...result });
        });
        write(controller, { type: "done", total: domains.length });
      } catch (err) {
        if (!request.signal.aborted) {
          write(controller, {
            type: "error",
            message: err instanceof Error ? err.message : "Erreur inattendue.",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
