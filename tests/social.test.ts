import { describe, expect, it } from "vitest";

import { interpretSocialStatus, toHandle, PLATFORMS } from "@/lib/providers/social";

describe("interpretSocialStatus", () => {
  it("404 → libre", () => {
    expect(interpretSocialStatus(404)).toBe("available");
  });

  it("2xx → pris", () => {
    expect(interpretSocialStatus(200)).toBe("taken");
    expect(interpretSocialStatus(204)).toBe("taken");
  });

  it("redirections et erreurs → indéterminé", () => {
    expect(interpretSocialStatus(301)).toBe("unknown");
    expect(interpretSocialStatus(403)).toBe("unknown");
    expect(interpretSocialStatus(500)).toBe("unknown");
  });
});

describe("toHandle", () => {
  it("retire les tirets du label", () => {
    expect(toHandle("ice-cream")).toBe("icecream");
    expect(toHandle("photo")).toBe("photo");
  });
});

describe("PLATFORMS", () => {
  it("construit des URLs de profil valides", () => {
    const github = PLATFORMS.find((p) => p.id === "github");
    expect(github?.url("acme")).toBe("https://github.com/acme");
  });
});
