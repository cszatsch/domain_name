/**
 * Résout `promise` normalement, ou renvoie `fallback` si le délai `ms` est
 * dépassé (garde-fou : garantit qu'une opération aboutit toujours à temps).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

/**
 * Applique `worker` à chaque élément avec une limite de concurrence.
 * Les workers consomment les éléments depuis un index partagé : dès qu'un worker
 * termine, il enchaîne sur l'élément suivant disponible. L'ordre d'achèvement
 * n'est donc pas garanti (volontaire : on streame au fil de l'eau).
 */
export async function pooledMap<T>(
  concurrency: number,
  items: readonly T[],
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const size = Math.max(1, Math.min(concurrency, items.length));

  const runner = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: size }, runner));
}
