import { createRateLimitStore } from './create-rate-limit-store.js';
import { InMemoryRateLimitStore } from './in-memory-rate-limit-store.js';
import { RedisRateLimitStore } from './redis-rate-limit-store.js';

const REDIS_URL = 'redis://localhost:6379';

describe('createRateLimitStore', () => {
  it.each([undefined, 'memory'])(
    'should create the in-memory store for %j',
    (type) => {
      expect(createRateLimitStore(type, REDIS_URL)).toBeInstanceOf(
        InMemoryRateLimitStore,
      );
    },
  );

  it('should create the redis store for "redis"', async () => {
    const store = createRateLimitStore('redis', REDIS_URL);

    expect(store).toBeInstanceOf(RedisRateLimitStore);
    if (store instanceof RedisRateLimitStore) {
      await store.onModuleDestroy();
    }
  });

  it('should reject an unknown store type', () => {
    expect(() => createRateLimitStore('postgres', REDIS_URL)).toThrow(
      'Unknown RATE_LIMIT_STORE "postgres"',
    );
  });
});
