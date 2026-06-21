import { describe, expect, it } from "vitest";

import { interpretRdapStatus } from "@/lib/providers/availability/rdap";

describe("interpretRdapStatus", () => {
  it("404 → disponible", () => {
    expect(interpretRdapStatus(404)).toBe("available");
  });

  it("200 → pris", () => {
    expect(interpretRdapStatus(200)).toBe("taken");
  });

  it("429 et autres → indéterminé", () => {
    expect(interpretRdapStatus(429)).toBe("unknown");
    expect(interpretRdapStatus(500)).toBe("unknown");
    expect(interpretRdapStatus(403)).toBe("unknown");
  });
});
