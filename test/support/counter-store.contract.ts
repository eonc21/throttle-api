import { randomUUID } from 'node:crypto';
import { CounterStore } from '../../src/rate-limit/stores/counter/counter-store.js';

const LONG_TTL_MS = 60_000;
const SHORT_TTL_MS = 600;
const STILL_ALIVE_CHECK_AFTER_MS = 150;
const EXPIRY_CHECK_AFTER_MS = 500;

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
        counts.push(await store.increment(`${keyPrefix}:${key}`, LONG_TTL_MS));
      }

      expect(counts).toEqual([1, 2, 1, 3]);
    });

    it('should restart the count once the ttl set by the first increment elapsed', async () => {
      const key = `${keyPrefix}:a`;
      await store.increment(key, SHORT_TTL_MS);

      await sleep(STILL_ALIVE_CHECK_AFTER_MS);
      expect(await store.increment(key, SHORT_TTL_MS)).toBe(2);

      await sleep(EXPIRY_CHECK_AFTER_MS);
      expect(await store.get(key)).toBe(0);
      expect(await store.increment(key, SHORT_TTL_MS)).toBe(1);
    });

    it('should read the current count without changing it, and read 0 for an unknown key', async () => {
      const key = `${keyPrefix}:a`;
      expect(await store.get(key)).toBe(0);

      await store.increment(key, LONG_TTL_MS);
      await store.increment(key, LONG_TTL_MS);

      expect(await store.get(key)).toBe(2);
      expect(await store.get(key)).toBe(2);
      expect(await store.increment(key, LONG_TTL_MS)).toBe(3);
    });
  });
}
