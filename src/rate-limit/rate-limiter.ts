import { Client } from '../auth/client.js';

export abstract class RateLimiter {
  abstract consume(client: Client): boolean;
}
