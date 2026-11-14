import { Injectable } from '@nestjs/common';
import { Client } from '../../auth/client.js';
import { CounterStore } from '../stores/counter/counter-store.js';
import { RateLimiter } from './rate-limiter.js';

@Injectable()
export class SlidingWindowCounterRateLimiter extends RateLimiter {
  constructor(private readonly store: CounterStore) {
    super();
  }

  async consume({ id, rateLimit }: Client): Promise<boolean> {
    const windowMs = rateLimit.windowSeconds * 1000;
    const nowMs = Date.now();
    const currentWindowIndex = Math.floor(nowMs / windowMs);
    const elapsedInWindowMs = nowMs - currentWindowIndex * windowMs;
    const previousWindowWeight = 1 - elapsedInWindowMs / windowMs;

    const previousWindowCount = await this.store.get(
      this.counterKey(id, currentWindowIndex - 1),
    );
    const currentWindowCount = await this.store.increment(
      this.counterKey(id, currentWindowIndex),
      2 * windowMs,
    );

    const estimatedRequestCount =
      previousWindowCount * previousWindowWeight + currentWindowCount;

    return estimatedRequestCount <= rateLimit.limit;
  }

  private counterKey(clientId: string, windowIndex: number): string {
    return `sliding-window:${clientId}:${windowIndex}`;
  }
}
