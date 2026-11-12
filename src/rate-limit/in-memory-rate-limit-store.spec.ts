import { InMemoryRateLimitStore } from './in-memory-rate-limit-store.js';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    store = new InMemoryRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should count increments per key', async () => {
    const counts: number[] = [];

    for (const key of ['a', 'a', 'b', 'a']) {
      counts.push(await store.increment(key, 1000));
    }

    expect(counts).toEqual([1, 2, 1, 3]);
  });

  it('should restart the count once the ttl set by the first increment elapsed', async () => {
    await store.increment('a', 1000);

    vi.advanceTimersByTime(999);
    expect(await store.increment('a', 1000)).toBe(2);

    vi.advanceTimersByTime(1);
    expect(await store.increment('a', 1000)).toBe(1);
  });
});
