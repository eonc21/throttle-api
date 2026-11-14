import { Injectable } from '@nestjs/common';
import { Client } from '../../auth/client.js';
import { CounterStore } from '../stores/counter/counter-store.js';
import { RateLimiter } from './rate-limiter.js';

@Injectable()
export class FixedWindowRateLimiter extends RateLimiter {
  constructor(private readonly store: CounterStore) {
    super();
  }

  async consume({ id, rateLimit }: Client): Promise<boolean> {
    const windowMs = rateLimit.windowSeconds * 1000;
    const now = Date.now();
    const windowEndsAt = (Math.floor(now / windowMs) + 1) * windowMs;

    const count = await this.store.increment(
      `fixed-window:${id}`,
      windowEndsAt - now,
    );

    return count <= rateLimit.limit;
  }
}
