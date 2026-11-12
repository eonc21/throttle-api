import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthorizationGuard } from './authorization.guard.js';

function contextWithHeaders(headers: Record<string, string>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;
}

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;

  beforeEach(() => {
    guard = new AuthorizationGuard();
  });

  it.each(['Bearer authorized_client', 'bearer authorized_client'])(
    'should let %j through',
    (authorization) => {
      expect(guard.canActivate(contextWithHeaders({ authorization }))).toBe(
        true,
      );
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
