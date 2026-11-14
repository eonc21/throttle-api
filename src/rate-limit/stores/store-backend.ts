export type StoreBackend = 'memory' | 'redis';

export function parseStoreBackend(value: string | undefined): StoreBackend {
  switch (value) {
    case undefined:
    case 'memory':
      return 'memory';
    case 'redis':
      return 'redis';
    default:
      throw new Error(`Unknown RATE_LIMIT_STORE "${value}"`);
  }
}
