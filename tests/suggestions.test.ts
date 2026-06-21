import { describe, expect, it } from "vitest";

import { ruleBasedCandidates } from "@/lib/providers/suggestions/rules";
import { parseDatamuse } from "@/lib/providers/suggestions/datamuse";
import { buildCandidates } from "@/lib/providers/suggestions";

describe("ruleBasedCandidates", () => {
  it("génère préfixes, suffixes et pluriel", () => {
    const out = ruleBasedCandidates("photo");
    expect(out).toContain("getphoto");
    expect(out).toContain("photoapp");
    expect(out).toContain("photos");
  });
});

describe("parseDatamuse", () => {
  it("extrait les mots du format [{word}, ...]", () => {
    const out = parseDatamuse([{ word: "image" }, { word: "picture", score: 10 }]);
    expect(out).toEqual(["image", "picture"]);
  });

  it("ignore les entrées invalides et plafonne", () => {
    expect(parseDatamuse([{ word: "a" }, {}, { word: 5 }, { word: "b" }], 1)).toEqual(["a"]);
    expect(parseDatamuse("nope")).toEqual([]);
  });
});

describe("buildCandidates", () => {
  it("combine mots associés et règles, en excluant le terme d'origine", () => {
    const out = buildCandidates("photo", ["image", "picture"]);
    expect(out).toContain("image");
    expect(out).toContain("picture");
    expect(out).not.toContain("photo");
  });

  it("dédoublonne, normalise et plafonne la liste", () => {
    const out = buildCandidates("photo", ["Image", "image", "ice cream"], 5);
    expect(out).toContain("image");
    expect(out).toContain("ice-cream"); // normalisé
    expect(out.length).toBeLessThanOrEqual(5);
    expect(new Set(out).size).toBe(out.length); // pas de doublons
  });
});
