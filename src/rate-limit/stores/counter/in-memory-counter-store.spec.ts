import { describeCounterStore } from '../../../../test/support/counter-store.contract.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';

describeCounterStore('InMemoryCounterStore', () => new InMemoryCounterStore());

describe('InMemoryCounterStore memory use', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should drop expired counters instead of keeping them forever', async () => {
    const store = new InMemoryCounterStore();
    for (let i = 0; i < 100; i++) {
      await store.increment(`key-${i}`, 1_000);
    }

    vi.advanceTimersByTime(120_000);
    await store.increment('fresh-key', 1_000);

    expect(store['counterByKey'].size).toBe(1);
  });
});
