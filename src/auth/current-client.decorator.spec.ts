import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.js';
import { Client } from './client.js';
import { getCurrentClient } from './current-client.decorator.js';

function contextWithRequest(request: Partial<AuthenticatedRequest>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('getCurrentClient', () => {
  it('should return the client attached to the request', () => {
    const client: Client = {
      id: 'authorized_client',
      rateLimit: { limit: 5, windowSeconds: 60 },
    };

    expect(
      getCurrentClient(
        undefined,
        contextWithRequest({ authenticatedClient: client }),
      ),
    ).toBe(client);
  });

  it('should throw when no client was attached to the request', () => {
    expect(() => getCurrentClient(undefined, contextWithRequest({}))).toThrow(
      UnauthorizedException,
    );
  });
});
