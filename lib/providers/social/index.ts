import type { AvailabilityStatus, SocialResult } from "@/lib/types";

import { pooledMap, withTimeout } from "@/lib/concurrency";

const PROBE_TIMEOUT_MS = 6000;
const USER_AGENT = "Mozilla/5.0 (compatible; domain-name-app/0.1)";

interface Platform {
  id: string;
  name: string;
  url: (handle: string) => string;
}

export const PLATFORMS: readonly Platform[] = [
  { id: "github", name: "GitHub", url: (h) => `https://github.com/${h}` },
  { id: "instagram", name: "Instagram", url: (h) => `https://www.instagram.com/${h}/` },
  { id: "x", name: "X (Twitter)", url: (h) => `https://x.com/${h}` },
  { id: "tiktok", name: "TikTok", url: (h) => `https://www.tiktok.com/@${h}` },
  { id: "youtube", name: "YouTube", url: (h) => `https://www.youtube.com/@${h}` },
];

/** Dérive un identifiant social depuis un label (les handles n'ont pas de tirets). */
export function toHandle(label: string): string {
  return label.replace(/-/g, "");
}

/**
 * Interprète un code HTTP de page de profil :
 * 404 → libre, 2xx → pris, autre → indéterminé.
 * Best-effort : certaines plateformes renvoient 2xx même pour un profil absent.
 */
export function interpretSocialStatus(httpStatus: number): AvailabilityStatus {
  if (httpStatus === 404) return "available";
  if (httpStatus >= 200 && httpStatus < 300) return "taken";
  return "unknown";
}

async function probe(
  platform: Platform,
  handle: string,
  signal?: AbortSignal,
): Promise<SocialResult> {
  const url = platform.url(handle);
  const base = { platform: platform.id, name: platform.name, handle, url };
  const timeout = AbortSignal.timeout(PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    return { ...base, status: interpretSocialStatus(res.status) };
  } catch {
    return { ...base, status: "unknown" };
  }
}

/** Vérifie la disponibilité du handle sur chaque plateforme (best-effort). */
export async function checkSocial(label: string, signal?: AbortSignal): Promise<SocialResult[]> {
  const handle = toHandle(label);
  const results: SocialResult[] = new Array(PLATFORMS.length);

  await pooledMap(PLATFORMS.length, PLATFORMS, async (platform, index) => {
    results[index] = await withTimeout(probe(platform, handle, signal), PROBE_TIMEOUT_MS + 1000, {
      platform: platform.id,
      name: platform.name,
      handle,
      url: platform.url(handle),
      status: "unknown",
    });
  });

  return results;
}
