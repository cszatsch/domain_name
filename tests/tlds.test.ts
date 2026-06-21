import { describe, expect, it } from "vitest";

import { TLDS, VALID_TLDS } from "@/lib/tlds";

describe("TLDS", () => {
  it("ne contient pas de doublons", () => {
    const set = new Set(TLDS.map((t) => t.tld));
    expect(set.size).toBe(TLDS.length);
  });

  it("n'utilise que des caractères d'extension valides", () => {
    for (const { tld } of TLDS) {
      expect(tld).toMatch(/^[a-z]{2,}$/);
    }
  });

  it("expose un set cohérent avec la liste", () => {
    expect(VALID_TLDS.size).toBe(TLDS.length);
  });
});
