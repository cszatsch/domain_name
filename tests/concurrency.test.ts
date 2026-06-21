import { describe, expect, it } from "vitest";

import { pooledMap, withTimeout } from "@/lib/concurrency";

describe("pooledMap", () => {
  it("traite tous les éléments", async () => {
    const items = [1, 2, 3, 4, 5];
    const seen: number[] = [];
    await pooledMap(2, items, async (n) => {
      seen.push(n);
    });
    expect(seen.sort()).toEqual(items);
  });

  it("respecte la limite de concurrence", async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    let active = 0;
    let maxActive = 0;
    await pooledMap(3, items, async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
    });
    expect(maxActive).toBeLessThanOrEqual(3);
    expect(maxActive).toBeGreaterThan(1);
  });

  it("ne plante pas sur une liste vide", async () => {
    await expect(pooledMap(4, [], async () => {})).resolves.toBeUndefined();
  });
});

describe("withTimeout", () => {
  it("renvoie la valeur si la promesse aboutit à temps", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 100, "fallback");
    expect(result).toBe("ok");
  });

  it("renvoie le fallback si le délai est dépassé", async () => {
    const slow = new Promise<string>((r) => setTimeout(() => r("trop tard"), 50));
    const result = await withTimeout(slow, 10, "fallback");
    expect(result).toBe("fallback");
  });

  it("renvoie le fallback si la promesse échoue", async () => {
    const result = await withTimeout(Promise.reject(new Error("boom")), 100, "fallback");
    expect(result).toBe("fallback");
  });
});
