import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchPorkbunPricing, parsePorkbunPricing } from "@/lib/providers/pricing/porkbun";

describe("parsePorkbunPricing", () => {
  it("parse les tarifs et convertit les montants en nombres", () => {
    const map = parsePorkbunPricing({
      status: "SUCCESS",
      pricing: {
        com: { registration: "9.68", renewal: "11.06", transfer: "9.68" },
        io: { registration: "32.00", renewal: "32.00", transfer: "32.00" },
      },
    });
    expect(map.com.registration).toBe(9.68);
    expect(map.com.renewal).toBe(11.06);
    expect(map.io.transfer).toBe(32);
  });

  it("met null pour les montants manquants ou invalides", () => {
    const map = parsePorkbunPricing({
      status: "SUCCESS",
      pricing: {
        foo: { registration: "abc" },
      },
    });
    expect(map.foo.registration).toBeNull();
    expect(map.foo.renewal).toBeNull();
    expect(map.foo.transfer).toBeNull();
  });

  it("normalise les extensions en minuscules", () => {
    const map = parsePorkbunPricing({
      status: "SUCCESS",
      pricing: { COM: { registration: "1.00", renewal: "1.00", transfer: "1.00" } },
    });
    expect(map.com).toBeDefined();
    expect(map.COM).toBeUndefined();
  });

  it("lève une erreur si le statut n'est pas SUCCESS", () => {
    expect(() => parsePorkbunPricing({ status: "ERROR", pricing: {} } as never)).toThrow();
  });
});

describe("fetchPorkbunPricing", () => {
  afterEach(() => vi.restoreAllMocks());

  it("appelle l'API et parse la réponse", async () => {
    const json = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      pricing: { com: { registration: "9.68", renewal: "11.06", transfer: "9.68" } },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json } as unknown as Response);

    const map = await fetchPorkbunPricing();
    expect(map.com.registration).toBe(9.68);
    expect(map.com.renewal).toBe(11.06);
  });

  it("lève une erreur sur réponse HTTP non-ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    await expect(fetchPorkbunPricing()).rejects.toThrow(/500/);
  });
});
