import { Injectable } from '@nestjs/common';
import { Client } from './client.js';

const CLIENTS: readonly Client[] = [
  { id: 'authorized_client', rateLimit: { limit: 5, windowSeconds: 60 } },
  { id: 'premium_client', rateLimit: { limit: 20, windowSeconds: 60 } },
];

@Injectable()
export class ClientRegistry {
  private readonly clients = new Map<string, Client>(
    CLIENTS.map((client) => [client.id, client]),
  );

  find(id: string): Client | undefined {
    return this.clients.get(id);
  }
}
