import { Injectable } from '@nestjs/common';
import { Client } from '../auth/client.js';
import { RateLimitStore } from './rate-limit-store.js';
import { RateLimiter } from './rate-limiter.js';

@Injectable()
export class FixedWindowRateLimiter extends RateLimiter {
  constructor(private readonly store: RateLimitStore) {
    super();
  }

  async consume({ id, rateLimit }: Client): Promise<boolean> {
    const windowMs = rateLimit.windowSeconds * 1000;
    const now = Date.now();
    const windowEndsAt = (Math.floor(now / windowMs) + 1) * windowMs;

    const count = await this.store.increment(id, windowEndsAt - now);

    return count <= rateLimit.limit;
  }
}
