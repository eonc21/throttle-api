import { createCounterStore } from './create-counter-store.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';
import { RedisCounterStore } from './redis-counter-store.js';

const REDIS_URL = 'redis://localhost:6379';

describe('createCounterStore', () => {
  it('should create the in-memory store for the memory backend', () => {
    expect(createCounterStore('memory', REDIS_URL)).toBeInstanceOf(
      InMemoryCounterStore,
    );
  });

  it('should create the redis store for the redis backend', async () => {
    const store = createCounterStore('redis', REDIS_URL);

    expect(store).toBeInstanceOf(RedisCounterStore);
    if (store instanceof RedisCounterStore) {
      await store.onModuleDestroy();
    }
  });
});
