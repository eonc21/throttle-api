import { Injectable } from '@nestjs/common';
import { RateLimitStore } from './rate-limit-store.js';

interface Counter {
  count: number;
  expiresAt: number;
}

@Injectable()
export class InMemoryRateLimitStore extends RateLimitStore {
  private readonly counters = new Map<string, Counter>();

  increment(key: string, ttlMs: number): Promise<number> {
    const now = Date.now();
    const stored = this.counters.get(key);
    const counter: Counter =
      stored && stored.expiresAt > now
        ? stored
        : { count: 0, expiresAt: now + ttlMs };

    counter.count += 1;
    this.counters.set(key, counter);
    return Promise.resolve(counter.count);
  }
}
