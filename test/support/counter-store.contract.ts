import { randomUUID } from 'node:crypto';
import { CounterStore } from '../../src/rate-limit/stores/counter/counter-store.js';

const TTL_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function describeCounterStore(
  name: string,
  createStore: () => CounterStore,
): void {
  describe(`${name} (CounterStore contract)`, () => {
    let store: CounterStore;
    let keyPrefix: string;

    beforeEach(() => {
      store = createStore();
      keyPrefix = randomUUID();
    });

    it('should count increments per key', async () => {
      const counts: number[] = [];

      for (const key of ['a', 'a', 'b', 'a']) {
        counts.push(await store.increment(`${keyPrefix}:${key}`, TTL_MS));
      }

      expect(counts).toEqual([1, 2, 1, 3]);
    });

    it('should restart the count once the ttl set by the first increment elapsed', async () => {
      const key = `${keyPrefix}:a`;
      await store.increment(key, TTL_MS);

      await sleep(200);
      expect(await store.increment(key, TTL_MS)).toBe(2);

      await sleep(150);
      expect(await store.get(key)).toBe(0);
      expect(await store.increment(key, TTL_MS)).toBe(1);
    });

    it('should read the current count without changing it, and read 0 for an unknown key', async () => {
      const key = `${keyPrefix}:a`;
      expect(await store.get(key)).toBe(0);

      await store.increment(key, TTL_MS);
      await store.increment(key, TTL_MS);

      expect(await store.get(key)).toBe(2);
      expect(await store.get(key)).toBe(2);
      expect(await store.increment(key, TTL_MS)).toBe(3);
    });
  });
}
