import { Redis } from 'ioredis';
import { RedisCounterStore } from '../src/rate-limit/stores/counter/redis-counter-store.js';
import { describeCounterStore } from './support/counter-store.contract.js';

const TEST_REDIS_URL = 'redis://localhost:6379/2';

const redis = new Redis(TEST_REDIS_URL);

afterAll(async () => {
  await redis.quit();
});

describeCounterStore('RedisCounterStore', () => new RedisCounterStore(redis));
