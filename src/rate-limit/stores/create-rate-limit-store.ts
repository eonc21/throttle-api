import { Redis } from 'ioredis';
import { InMemoryRateLimitStore } from './in-memory-rate-limit-store.js';
import { RateLimitStore } from './rate-limit-store.js';
import { RedisRateLimitStore } from './redis-rate-limit-store.js';

export function createRateLimitStore(
  type: string | undefined,
  redisUrl: string,
): RateLimitStore {
  switch (type) {
    case undefined:
    case 'memory':
      return new InMemoryRateLimitStore();
    case 'redis':
      return new RedisRateLimitStore(
        new Redis(redisUrl, { lazyConnect: true }),
      );
    default:
      throw new Error(`Unknown RATE_LIMIT_STORE "${type}"`);
  }
}
