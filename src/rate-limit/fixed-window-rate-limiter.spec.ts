import { Client } from '../auth/client.js';
import { FixedWindowRateLimiter } from './fixed-window-rate-limiter.js';

const WINDOW_START = new Date('2026-01-01T00:00:00.000Z');

function clientWith(id: string, limit: number): Client {
  return { id, rateLimit: { limit, windowSeconds: 60 } };
}

describe('FixedWindowRateLimiter', () => {
  let limiter: FixedWindowRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    limiter = new FixedWindowRateLimiter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests up to the limit and deny the next one', () => {
    const client = clientWith('a', 3);

    const results = [1, 2, 3, 4].map(() => limiter.consume(client));

    expect(results).toEqual([true, true, true, false]);
  });

  it('should keep denying until the window ends and then start a new one', () => {
    const client = clientWith('a', 1);
    limiter.consume(client);

    vi.setSystemTime(WINDOW_START.getTime() + 59_999);
    expect(limiter.consume(client)).toBe(false);

    vi.setSystemTime(WINDOW_START.getTime() + 60_000);
    expect(limiter.consume(client)).toBe(true);
  });

  it('should count each client separately, using its own limit', () => {
    const small = clientWith('small', 1);
    const large = clientWith('large', 2);
    limiter.consume(small);
    limiter.consume(large);

    expect(limiter.consume(small)).toBe(false);
    expect(limiter.consume(large)).toBe(true);
  });
});
