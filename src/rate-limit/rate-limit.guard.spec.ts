import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { Client } from '../auth/client.js';
import { RateLimitExceededException } from './rate-limit-exceeded.exception.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { RateLimiter } from './limiters/rate-limiter.js';
import { RateLimitStoreUnavailableError } from './stores/rate-limit-store-unavailable.error.js';

const CLIENT: Client = {
  id: 'a',
  rateLimit: { limit: 1, windowSeconds: 60 },
};

class FooController {}

function get(): void {}

function contextFor(authenticatedClient: Client): ExecutionContext {
  const request: Partial<AuthenticatedRequest> = { authenticatedClient };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getClass: () => FooController,
    getHandler: () => get,
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  const consume = vi.fn<(client: Client, scope: string) => Promise<boolean>>();
  const rateLimiter: RateLimiter = { consume };
  let guard: RateLimitGuard;

  beforeEach(() => {
    consume.mockReset();
    guard = new RateLimitGuard(rateLimiter);
  });

  it('should let the request through when the limiter allows the client', async () => {
    consume.mockResolvedValue(true);

    await expect(guard.canActivate(contextFor(CLIENT))).resolves.toBe(true);
    expect(consume).toHaveBeenCalledWith(CLIENT, 'FooController.get');
  });

  it('should reject the request when the limiter denies the client', async () => {
    consume.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(CLIENT))).rejects.toThrow(
      RateLimitExceededException,
    );
  });

  it('should answer 503 instead of letting the request through when the store is unavailable', async () => {
    consume.mockRejectedValue(new RateLimitStoreUnavailableError());

    await expect(guard.canActivate(contextFor(CLIENT))).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should not hide unexpected errors', async () => {
    const unexpectedError = new Error('boom');
    consume.mockRejectedValue(unexpectedError);

    await expect(guard.canActivate(contextFor(CLIENT))).rejects.toBe(
      unexpectedError,
    );
  });
});
