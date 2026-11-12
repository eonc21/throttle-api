import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { Client } from '../auth/client.js';
import { RateLimitExceededException } from './rate-limit-exceeded.exception.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { RateLimiter } from './rate-limiter.js';

const CLIENT: Client = {
  id: 'a',
  rateLimit: { limit: 1, windowSeconds: 60 },
};

function contextFor(authenticatedClient: Client): ExecutionContext {
  const request: Partial<AuthenticatedRequest> = { authenticatedClient };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  const consume = vi.fn<(client: Client) => boolean>();
  const rateLimiter: RateLimiter = { consume };
  let guard: RateLimitGuard;

  beforeEach(() => {
    consume.mockReset();
    guard = new RateLimitGuard(rateLimiter);
  });

  it('should let the request through when the limiter allows the client', () => {
    consume.mockReturnValue(true);

    expect(guard.canActivate(contextFor(CLIENT))).toBe(true);
    expect(consume).toHaveBeenCalledWith(CLIENT);
  });

  it('should reject the request when the limiter denies the client', () => {
    consume.mockReturnValue(false);

    expect(() => guard.canActivate(contextFor(CLIENT))).toThrow(
      RateLimitExceededException,
    );
  });
});
