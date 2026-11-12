import type { Request } from 'express';
import { Client } from './client.js';

export interface AuthenticatedRequest extends Request {
  authenticatedClient?: Client;
}
