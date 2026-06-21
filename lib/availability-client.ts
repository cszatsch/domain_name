import type { AvailabilityStreamLine } from "@/lib/types";

interface StreamHandlers {
  signal?: AbortSignal;
  onLine: (line: AvailabilityStreamLine) => void;
}

/**
 * Appelle /api/availability et invoque `onLine` pour chaque objet NDJSON reçu,
 * au fil de l'eau. Côté client uniquement (utilise fetch streaming).
 */
export async function streamAvailability(
  term: string,
  { signal, onLine }: StreamHandlers,
): Promise<void> {
  const res = await fetch("/api/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ term }),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Erreur serveur (${res.status}).`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // réponse non-JSON : on garde le message par défaut
    }
    onLine({ type: "error", message });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const raw = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (raw) onLine(JSON.parse(raw) as AvailabilityStreamLine);
    }
  }

  const tail = buffer.trim();
  if (tail) onLine(JSON.parse(tail) as AvailabilityStreamLine);
}
