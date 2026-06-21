import { describe, expect, it } from "vitest";

import { parseSuggest } from "@/lib/providers/seo/google-suggest";
import { parsePageviews } from "@/lib/providers/seo/wikipedia";
import { computeCompetition } from "@/lib/providers/seo/competition";

describe("parseSuggest", () => {
  it("extrait les suggestions du format [terme, [...]]", () => {
    const out = parseSuggest(["photo", ["photo studio", "photo editor"]]);
    expect(out).toEqual(["photo studio", "photo editor"]);
  });

  it("ignore les valeurs non-string et plafonne la longueur", () => {
    const raw = ["x", ["a", 1, "b", null, "c"]];
    expect(parseSuggest(raw, 2)).toEqual(["a", "b"]);
  });

  it("renvoie un tableau vide sur format inattendu", () => {
    expect(parseSuggest(null)).toEqual([]);
    expect(parseSuggest({})).toEqual([]);
    expect(parseSuggest(["x"])).toEqual([]);
  });
});

describe("parsePageviews", () => {
  it("renvoie les vues du dernier mois", () => {
    expect(parsePageviews({ items: [{ views: 100 }, { views: 250 }] })).toBe(250);
  });

  it("renvoie null si aucune donnée", () => {
    expect(parsePageviews({ items: [] })).toBeNull();
    expect(parsePageviews({})).toBeNull();
  });
});

describe("computeCompetition", () => {
  it("renvoie null sans aucun signal", () => {
    expect(computeCompetition({ monthlyViews: null, relatedCount: 0 })).toBeNull();
    expect(computeCompetition({ monthlyViews: 0, relatedCount: 0 })).toBeNull();
  });

  it("classe un terme très visible en concurrence élevée", () => {
    const c = computeCompetition({ monthlyViews: 1_000_000, relatedCount: 8 });
    expect(c?.level).toBe("high");
    expect(c?.score).toBeGreaterThanOrEqual(66);
  });

  it("classe un terme peu visible en concurrence faible", () => {
    const c = computeCompetition({ monthlyViews: 100, relatedCount: 0 });
    expect(c?.level).toBe("low");
  });

  it("borne le score entre 0 et 100", () => {
    const c = computeCompetition({ monthlyViews: 50_000_000, relatedCount: 50 });
    expect(c?.score).toBeLessThanOrEqual(100);
    expect(c?.score).toBeGreaterThanOrEqual(0);
  });
});
