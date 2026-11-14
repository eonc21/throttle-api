import { parseStoreBackend } from './store-backend.js';

describe('parseStoreBackend', () => {
  it.each([
    [undefined, 'memory'],
    ['memory', 'memory'],
    ['redis', 'redis'],
  ])('should turn %j into %j', (value, expectedBackend) => {
    expect(parseStoreBackend(value)).toBe(expectedBackend);
  });

  it('should reject an unknown backend', () => {
    expect(() => parseStoreBackend('postgres')).toThrow(
      'Unknown RATE_LIMIT_STORE "postgres"',
    );
  });
});
