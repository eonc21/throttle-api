import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.js';
import { Client } from './client.js';
import { ClientRegistry } from './client-registry.js';
import {
  ParsedAuthorizationHeader,
  parseAuthorizationHeader,
} from './parse-authorization-header.js';

const BEARER_SCHEME = 'bearer';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly clientRegistry: ClientRegistry) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const parsed = parseAuthorizationHeader(request.headers.authorization);
    const client = parsed && this.findClient(parsed);

    if (!client) {
      throw new UnauthorizedException();
    }

    request.authenticatedClient = client;
    return true;
  }

  private findClient({
    scheme,
    credentials,
  }: ParsedAuthorizationHeader): Client | undefined {
    return scheme.toLowerCase() === BEARER_SCHEME
      ? this.clientRegistry.find(credentials)
      : undefined;
  }
}
