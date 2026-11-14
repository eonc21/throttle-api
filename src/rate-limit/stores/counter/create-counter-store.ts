import { createRedisClient } from '../redis-client.js';
import { CounterStore } from './counter-store.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';
import { RedisCounterStore } from './redis-counter-store.js';

export function createCounterStore(
  storeType: string | undefined,
  redisUrl: string,
): CounterStore {
  switch (storeType) {
    case undefined:
    case 'memory':
      return new InMemoryCounterStore();
    case 'redis':
      return new RedisCounterStore(createRedisClient(redisUrl));
    default:
      throw new Error(`Unknown RATE_LIMIT_STORE "${storeType}"`);
  }
}
