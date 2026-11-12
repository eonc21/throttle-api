import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.js';
import { Client } from './client.js';

export function getCurrentClient(
  _data: unknown,
  context: ExecutionContext,
): Client {
  const { authenticatedClient } = context
    .switchToHttp()
    .getRequest<AuthenticatedRequest>();

  if (!authenticatedClient) {
    throw new UnauthorizedException();
  }

  return authenticatedClient;
}

export const CurrentClient = createParamDecorator(getCurrentClient);
