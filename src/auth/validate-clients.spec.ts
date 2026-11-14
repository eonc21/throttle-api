import { Client } from './client.js';
import { validateClients } from './validate-clients.js';

function clientWith(id: string, limit: number, windowSeconds: number): Client {
  return { id, rateLimit: { limit, windowSeconds } };
}

describe('validateClients', () => {
  it('should accept clients with positive whole limits and windows', () => {
    expect(() =>
      validateClients([clientWith('a', 5, 60), clientWith('b', 20, 30)]),
    ).not.toThrow();
  });

  it.each([
    [
      'a zero limit',
      clientWith('a', 0, 60),
      'Client "a": limit must be a positive whole number',
    ],
    [
      'a negative limit',
      clientWith('a', -1, 60),
      'Client "a": limit must be a positive whole number',
    ],
    [
      'a fractional limit',
      clientWith('a', 1.5, 60),
      'Client "a": limit must be a positive whole number',
    ],
    [
      'a zero window',
      clientWith('a', 5, 0),
      'Client "a": windowSeconds must be a positive whole number',
    ],
    [
      'a fractional window',
      clientWith('a', 5, 0.5),
      'Client "a": windowSeconds must be a positive whole number',
    ],
    ['a blank id', clientWith('  ', 5, 60), 'Client ids must not be blank'],
  ])('should reject %s', (_name, client, expectedMessage) => {
    expect(() => validateClients([client])).toThrow(expectedMessage);
  });

  it('should reject two clients with the same id', () => {
    expect(() =>
      validateClients([clientWith('a', 5, 60), clientWith('a', 10, 60)]),
    ).toThrow('Client id "a" is defined more than once');
  });

  it('should report every problem at once', () => {
    expect(() =>
      validateClients([clientWith('a', 0, 60), clientWith('b', 5, 0)]),
    ).toThrow(
      /Client "a": limit must be a positive whole number[\s\S]*Client "b": windowSeconds must be a positive whole number/,
    );
  });
});
