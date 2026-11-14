import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Client } from '../auth/client.js';
import { getCurrentClient } from '../auth/current-client.decorator.js';
import { RateLimitExceededException } from './rate-limit-exceeded.exception.js';
import { RateLimiter } from './limiters/rate-limiter.js';
import { RateLimitStoreUnavailableError } from './stores/rate-limit-store-unavailable.error.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiter: RateLimiter) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = getCurrentClient(undefined, context);
    const scope = `${context.getClass().name}.${context.getHandler().name}`;

    if (!(await this.tryConsume(client, scope))) {
      throw new RateLimitExceededException();
    }

    return true;
  }

  private async tryConsume(client: Client, scope: string): Promise<boolean> {
    try {
      return await this.rateLimiter.consume(client, scope);
    } catch (error) {
      if (error instanceof RateLimitStoreUnavailableError) {
        throw new ServiceUnavailableException();
      }
      throw error;
    }
  }
}
