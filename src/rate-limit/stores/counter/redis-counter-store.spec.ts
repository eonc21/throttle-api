import { createRedisClient } from '../redis-client.js';
import { RateLimitStoreUnavailableError } from '../rate-limit-store-unavailable.error.js';
import { RedisCounterStore } from './redis-counter-store.js';

describe('RedisCounterStore when redis cannot be reached', () => {
  let store: RedisCounterStore;

  beforeEach(() => {
    store = new RedisCounterStore(createRedisClient('redis://localhost:1'));
  });

  afterEach(async () => {
    await store.onModuleDestroy();
  });

  it('should fail fast with a store unavailable error when incrementing', async () => {
    const startedAtMs = Date.now();

    await expect(store.increment('key', 1_000)).rejects.toThrow(
      RateLimitStoreUnavailableError,
    );
    expect(Date.now() - startedAtMs).toBeLessThan(400);
  });

  it('should fail fast with a store unavailable error when reading', async () => {
    await expect(store.get('key')).rejects.toThrow(
      RateLimitStoreUnavailableError,
    );
  });
});
