import { Injectable } from '@nestjs/common';
import { Client } from '../../auth/client.js';
import { CounterStore } from '../stores/counter/counter-store.js';
import { RateLimiter } from './rate-limiter.js';

@Injectable()
export class FixedWindowRateLimiter extends RateLimiter {
  constructor(private readonly store: CounterStore) {
    super();
  }

  async consume({ id, rateLimit }: Client, scope: string): Promise<boolean> {
    const windowMs = rateLimit.windowSeconds * 1000; // 60 * 1000 = 60 000
    const now = Date.now(); // 37 000
    const windowEndsAt = (Math.floor(now / windowMs) + 1) * windowMs;
    // (floor(37 000 / 60 000) + 1) * 60 000 = 60 000
    const timeToLive = windowEndsAt - now; // 60 000 - 37 000 = 23 000

    // count = 3
    const count = await this.store.increment(
      `${scope}:fixed-window:${id}`,
      timeToLive, // 23 000
    );

    return count <= rateLimit.limit;
  }
}
