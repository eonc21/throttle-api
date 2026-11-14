import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getCurrentClient } from '../auth/current-client.decorator.js';
import { RateLimitExceededException } from './rate-limit-exceeded.exception.js';
import { RateLimiter } from './limiters/rate-limiter.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiter: RateLimiter) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = getCurrentClient(undefined, context);

    if (!(await this.rateLimiter.consume(client))) {
      throw new RateLimitExceededException();
    }

    return true;
  }
}
