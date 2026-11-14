import { randomUUID } from 'node:crypto';
import { RateLimitStore } from '../../src/rate-limit/stores/rate-limit-store.js';

const TTL_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function describeRateLimitStore(
  name: string,
  createStore: () => RateLimitStore,
): void {
  describe(`${name} (RateLimitStore contract)`, () => {
    let store: RateLimitStore;
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
      expect(await store.increment(key, TTL_MS)).toBe(1);
    });
  });
}
