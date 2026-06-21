import type { SeoNotoriety } from "@/lib/types";

import { SEO_USER_AGENT } from "@/lib/providers/seo/google-suggest";

const WIKI_LANG = "fr";
const SUMMARY_TIMEOUT_MS = 5000;
const PAGEVIEWS_TIMEOUT_MS = 5000;

interface PageviewsResponse {
  items?: { views?: number }[];
}

/** Extrait les vues du dernier mois renvoyé par l'API pageviews (fonction pure). */
export function parsePageviews(raw: PageviewsResponse): number | null {
  const items = raw?.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const last = items[items.length - 1];
  return typeof last?.views === "number" ? last.views : null;
}

/** Bornes [début, fin] sur les 2 derniers mois, au format YYYYMMDD attendu par l'API. */
function monthlyBounds(now = new Date()): { start: string; end: string } {
  const fmt = (y: number, m: number) => `${y}${String(m + 1).padStart(2, "0")}01`;
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  // start = 1er du mois il y a 2 mois ; end = 1er du mois courant.
  const startDate = new Date(Date.UTC(y, m - 2, 1));
  return {
    start: fmt(startDate.getUTCFullYear(), startDate.getUTCMonth()),
    end: fmt(y, m),
  };
}

async function fetchSummary(query: string): Promise<{ title: string; url: string } | null> {
  const url = `https://${WIKI_LANG}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": SEO_USER_AGENT },
    signal: AbortSignal.timeout(SUMMARY_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Wikipedia summary HTTP ${res.status}`);
  const data = (await res.json()) as {
    title?: string;
    content_urls?: { desktop?: { page?: string } };
  };
  if (!data.title) return null;
  const page =
    data.content_urls?.desktop?.page ??
    `https://${WIKI_LANG}.wikipedia.org/wiki/${encodeURIComponent(data.title)}`;
  return { title: data.title, url: page };
}

async function fetchMonthlyViews(title: string): Promise<number | null> {
  const { start, end } = monthlyBounds();
  const article = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${WIKI_LANG}.wikipedia/all-access/all-agents/${article}/monthly/${start}/${end}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": SEO_USER_AGENT },
    signal: AbortSignal.timeout(PAGEVIEWS_TIMEOUT_MS),
  });
  if (!res.ok) return null; // les vues sont optionnelles
  return parsePageviews((await res.json()) as PageviewsResponse);
}

/**
 * Notoriété du terme via Wikipédia : présence d'un article + vues mensuelles.
 * Proxy gratuit et officiel du niveau de concurrence / d'établissement du terme.
 */
export async function fetchNotoriety(query: string): Promise<SeoNotoriety> {
  const summary = await fetchSummary(query);
  if (!summary) return { hasArticle: false };

  let monthlyViews: number | null = null;
  try {
    monthlyViews = await fetchMonthlyViews(summary.title);
  } catch {
    monthlyViews = null;
  }
  return { hasArticle: true, title: summary.title, url: summary.url, monthlyViews };
}
