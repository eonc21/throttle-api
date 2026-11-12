import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.js';
import { AuthorizationGuard } from './authorization.guard.js';
import { ClientRegistry } from './client-registry.js';

function contextWithRequest(request: Partial<AuthenticatedRequest>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function contextWithHeaders(headers: Record<string, string>) {
  return contextWithRequest({ headers });
}

describe('AuthorizationGuard', () => {
  let registry: ClientRegistry;
  let guard: AuthorizationGuard;

  beforeEach(() => {
    registry = new ClientRegistry();
    guard = new AuthorizationGuard(registry);
  });

  it.each([
    'Bearer authorized_client',
    'bearer authorized_client',
    'Bearer premium_client',
    'bearer premium_client',
  ])('should let %j through', (authorization) => {
    expect(guard.canActivate(contextWithHeaders({ authorization }))).toBe(true);
  });

  it.each(['authorized_client', 'premium_client'])(
    'should attach %s to the request',
    (clientId) => {
      const request: Partial<AuthenticatedRequest> = {
        headers: { authorization: `Bearer ${clientId}` },
      };

      guard.canActivate(contextWithRequest(request));

      expect(request.authenticatedClient).toEqual(registry.find(clientId));
    },
  );

  it.each([
    'Bearer unauthorized_client',
    'Bearer Authorized_Client',
    'Bearer authorized_client extra',
    'Basic authorized_client',
  ])('should reject the authorization %j', (authorization) => {
    expect(() =>
      guard.canActivate(contextWithHeaders({ authorization })),
    ).toThrow(UnauthorizedException);
  });

  it.each<Record<string, string>>([
    {},
    { authorization: '' },
    { authorization: 'Bearer' },
  ])('should reject a request with headers %j', (headers) => {
    expect(() => guard.canActivate(contextWithHeaders(headers))).toThrow(
      UnauthorizedException,
    );
  });
});
