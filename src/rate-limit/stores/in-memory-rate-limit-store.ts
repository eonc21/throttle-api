import { Injectable } from '@nestjs/common';
import { RateLimitStore } from './rate-limit-store.js';

interface Counter {
  requestCount: number;
  expiresAtMs: number;
}

@Injectable()
export class InMemoryRateLimitStore extends RateLimitStore {
  private readonly counterByKey = new Map<string, Counter>();

  increment(key: string, ttlMs: number): Promise<number> {
    const nowMs = Date.now();
    const existingCounter = this.counterByKey.get(key);

    const isExistingCounterActive =
      existingCounter !== undefined && existingCounter.expiresAtMs > nowMs;

    const activeCounter: Counter = isExistingCounterActive
      ? existingCounter
      : { requestCount: 0, expiresAtMs: nowMs + ttlMs };

    activeCounter.requestCount += 1;
    this.counterByKey.set(key, activeCounter);
    return Promise.resolve(activeCounter.requestCount);
  }
}
