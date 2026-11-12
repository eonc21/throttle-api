import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ParsedAuthorizationHeader,
  parseAuthorizationHeader,
} from './parse-authorization-header.js';

const BEARER_SCHEME = 'bearer';
const AUTHORIZED_CLIENT_ID = 'authorized_client';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const parsed = parseAuthorizationHeader(request.headers.authorization);

    if (!parsed || !this.isAuthorizedClient(parsed)) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private isAuthorizedClient({
    scheme,
    credentials,
  }: ParsedAuthorizationHeader): boolean {
    return (
      scheme.toLowerCase() === BEARER_SCHEME &&
      credentials === AUTHORIZED_CLIENT_ID
    );
  }
}
