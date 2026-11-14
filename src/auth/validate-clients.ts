import { Client } from './client.js';

function isPositiveWholeNumber(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function validateClients(clients: readonly Client[]): void {
  const problems: string[] = [];
  const seenIds = new Set<string>();

  for (const { id, rateLimit } of clients) {
    if (id.trim() === '') {
      problems.push('Client ids must not be blank');
    }
    if (seenIds.has(id)) {
      problems.push(`Client id "${id}" is defined more than once`);
    }
    seenIds.add(id);
    if (!isPositiveWholeNumber(rateLimit.limit)) {
      problems.push(`Client "${id}": limit must be a positive whole number`);
    }
    if (!isPositiveWholeNumber(rateLimit.windowSeconds)) {
      problems.push(
        `Client "${id}": windowSeconds must be a positive whole number`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid client configuration:\n${problems.join('\n')}`);
  }
}
