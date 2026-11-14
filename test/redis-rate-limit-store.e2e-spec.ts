import { Redis } from 'ioredis';
import { RedisRateLimitStore } from '../src/rate-limit/stores/redis-rate-limit-store.js';
import { describeRateLimitStore } from './support/rate-limit-store.contract.js';

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

afterAll(async () => {
  await redis.quit();
});

describeRateLimitStore(
  'RedisRateLimitStore',
  () => new RedisRateLimitStore(redis),
);
