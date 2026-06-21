import { describe, expect, it } from "vitest";

import { pooledMap } from "@/lib/concurrency";

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
