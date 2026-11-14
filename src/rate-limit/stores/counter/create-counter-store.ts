import { Redis } from 'ioredis';
import { StoreBackend } from '../store-backend.js';
import { CounterStore } from './counter-store.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';
import { RedisCounterStore } from './redis-counter-store.js';

export function createCounterStore(
  backend: StoreBackend,
  redisUrl: string,
): CounterStore {
  switch (backend) {
    case 'memory':
      return new InMemoryCounterStore();
    case 'redis':
      return new RedisCounterStore(new Redis(redisUrl, { lazyConnect: true }));
  }
}
