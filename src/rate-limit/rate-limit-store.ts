export abstract class RateLimitStore {
  abstract increment(key: string, ttlMs: number): Promise<number>;
}
