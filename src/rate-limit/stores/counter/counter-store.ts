export abstract class CounterStore {
  abstract increment(key: string, ttlMs: number): Promise<number>;

  abstract get(key: string): Promise<number>;
}
