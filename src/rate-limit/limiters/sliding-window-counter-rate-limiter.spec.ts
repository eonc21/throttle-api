import { Client } from '../../auth/client.js';
import { InMemoryCounterStore } from '../stores/counter/in-memory-counter-store.js';
import { SlidingWindowCounterRateLimiter } from './sliding-window-counter-rate-limiter.js';

const WINDOW_MS = 60_000;
const WINDOW_START_MS = new Date('2026-01-01T00:00:00.000Z').getTime();
const WINDOW_INDEX = WINDOW_START_MS / WINDOW_MS;

function clientWith(id: string, limit: number): Client {
  return { id, rateLimit: { limit, windowSeconds: 60 } };
}

describe('SlidingWindowCounterRateLimiter', () => {
  let store: InMemoryCounterStore;
  let limiter: SlidingWindowCounterRateLimiter;

  const consumeTimes = async (
    client: Client,
    times: number,
  ): Promise<boolean[]> => {
    const results: boolean[] = [];

    for (let i = 0; i < times; i++) {
      results.push(await limiter.consume(client));
    }

    return results;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START_MS);
    store = new InMemoryCounterStore();
    limiter = new SlidingWindowCounterRateLimiter(store);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests up to the limit and deny the next one', async () => {
    const results = await consumeTimes(clientWith('a', 3), 4);

    expect(results).toEqual([true, true, true, false]);
  });

  it('should still count the whole previous window at the very start of the next one', async () => {
    const client = clientWith('a', 4);
    await consumeTimes(client, 4);

    vi.setSystemTime(WINDOW_START_MS + WINDOW_MS);

    expect(await limiter.consume(client)).toBe(false);
  });

  it('should count only the part of the previous window that still overlaps', async () => {
    const client = clientWith('a', 4);
    await consumeTimes(client, 4);

    vi.setSystemTime(WINDOW_START_MS + WINDOW_MS + 15_000);

    expect(await consumeTimes(client, 2)).toEqual([true, false]);
  });

  it('should forget a window once a whole window has passed after it', async () => {
    const client = clientWith('a', 4);
    await consumeTimes(client, 4);

    vi.setSystemTime(WINDOW_START_MS + 2 * WINDOW_MS);

    expect(await consumeTimes(client, 4)).toEqual([true, true, true, true]);
  });

  it('should count each client separately, using its own limit', async () => {
    const small = clientWith('small', 1);
    const large = clientWith('large', 2);
    await limiter.consume(small);
    await limiter.consume(large);

    expect(await limiter.consume(small)).toBe(false);
    expect(await limiter.consume(large)).toBe(true);
  });

  it('should keep one counter per window under a key namespaced by the algorithm', async () => {
    const increment = vi.spyOn(store, 'increment');
    const get = vi.spyOn(store, 'get');

    await limiter.consume(clientWith('a', 5));

    expect(increment).toHaveBeenCalledWith(
      `sliding-window:a:${WINDOW_INDEX}`,
      2 * WINDOW_MS,
    );
    expect(get).toHaveBeenCalledWith(`sliding-window:a:${WINDOW_INDEX - 1}`);
  });
});
