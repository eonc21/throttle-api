import { Injectable } from '@nestjs/common';
import { Client } from '../auth/client.js';
import { RateLimiter } from './rate-limiter.js';

interface Window {
  startsAt: number;
  count: number;
}

@Injectable()
export class FixedWindowRateLimiter extends RateLimiter {
  private readonly windows = new Map<string, Window>();

  consume({ id, rateLimit }: Client): boolean {
    const windowMs = rateLimit.windowSeconds * 1000;
    // round down the time to the nearest window start
    const windowStartedAt = Math.floor(Date.now() / windowMs) * windowMs;
    const storedWindow = this.windows.get(id);
    const window: Window =
      storedWindow?.startsAt === windowStartedAt
        ? storedWindow
        : { startsAt: windowStartedAt, count: 0 };

    this.windows.set(id, window);

    if (window.count >= rateLimit.limit) {
      return false;
    }

    window.count += 1;
    return true;
  }
}
