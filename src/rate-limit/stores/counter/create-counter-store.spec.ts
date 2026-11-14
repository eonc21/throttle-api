import { createCounterStore } from './create-counter-store.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';
import { RedisCounterStore } from './redis-counter-store.js';

const REDIS_URL = 'redis://localhost:6379';

describe('createCounterStore', () => {
  it.each([undefined, 'memory'])(
    'should create the in-memory store for %j',
    (storeType) => {
      expect(createCounterStore(storeType, REDIS_URL)).toBeInstanceOf(
        InMemoryCounterStore,
      );
    },
  );

  it('should create the redis store for "redis"', async () => {
    const store = createCounterStore('redis', REDIS_URL);

    expect(store).toBeInstanceOf(RedisCounterStore);
    if (store instanceof RedisCounterStore) {
      await store.onModuleDestroy();
    }
  });

  it('should reject an unknown store type', () => {
    expect(() => createCounterStore('postgres', REDIS_URL)).toThrow(
      'Unknown RATE_LIMIT_STORE "postgres"',
    );
  });
});
