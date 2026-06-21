// Cache mémoire minimal avec TTL.
//
// Suffisant pour le dev et pour mutualiser les appels au sein d'une instance
// serverless. En production multi-instances, remplacer par Upstash Redis
// (cf. Phase 5 du plan) en conservant la même signature `getOrSet`.

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

/** Retourne la valeur en cache si fraîche, sinon calcule, met en cache et retourne. */
export async function getOrSet<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const value = await factory();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** Vide le cache (utile pour les tests). */
export function clearCache(): void {
  store.clear();
}
