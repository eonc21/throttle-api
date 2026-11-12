import { ClientRegistry } from './client-registry.js';

describe('ClientRegistry', () => {
  let registry: ClientRegistry;

  beforeEach(() => {
    registry = new ClientRegistry();
  });

  it.each(['authorized_client', 'premium_client'])('finds %s', (id) => {
    expect(registry.find(id)?.id).toBe(id);
  });

  it('gives the clients different rate limits', () => {
    expect(registry.find('authorized_client')?.rateLimit).not.toEqual(
      registry.find('premium_client')?.rateLimit,
    );
  });

  it.each(['unknown_client', '', '__proto__', 'constructor'])(
    'returns undefined for %j',
    (id) => {
      expect(registry.find(id)).toBeUndefined();
    },
  );
});
