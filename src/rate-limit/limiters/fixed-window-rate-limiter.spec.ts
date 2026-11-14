import { Client } from '../../auth/client.js';
import { FixedWindowRateLimiter } from './fixed-window-rate-limiter.js';
import { InMemoryRateLimitStore } from '../stores/in-memory-rate-limit-store.js';

const WINDOW_START = new Date('2026-01-01T00:00:00.000Z');

function clientWith(id: string, limit: number): Client {
  return { id, rateLimit: { limit, windowSeconds: 60 } };
}

describe('FixedWindowRateLimiter', () => {
  let store: InMemoryRateLimitStore;
  let limiter: FixedWindowRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    store = new InMemoryRateLimitStore();
    limiter = new FixedWindowRateLimiter(store);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests up to the limit and deny the next one', async () => {
    const client = clientWith('a', 3);
    const results: boolean[] = [];

    for (let i = 0; i < 4; i++) {
      results.push(await limiter.consume(client));
    }

    expect(results).toEqual([true, true, true, false]);
  });

  it('should store the counts under a key namespaced by the algorithm', async () => {
    const increment = vi.spyOn(store, 'increment');

    await limiter.consume(clientWith('a', 1));

    expect(increment).toHaveBeenCalledWith(
      'fixed-window:a',
      expect.any(Number),
    );
  });

  it('should keep denying until the window ends and then start a new one', async () => {
    const client = clientWith('a', 1);
    await limiter.consume(client);

    vi.setSystemTime(WINDOW_START.getTime() + 59_999);
    expect(await limiter.consume(client)).toBe(false);

    vi.setSystemTime(WINDOW_START.getTime() + 60_000);
    expect(await limiter.consume(client)).toBe(true);
  });

  it('should count each client separately, using its own limit', async () => {
    const small = clientWith('small', 1);
    const large = clientWith('large', 2);
    await limiter.consume(small);
    await limiter.consume(large);

    expect(await limiter.consume(small)).toBe(false);
    expect(await limiter.consume(large)).toBe(true);
  });
});
