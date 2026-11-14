export class RateLimitStoreUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('The rate limit store is unavailable', { cause });
    this.name = 'RateLimitStoreUnavailableError';
  }
}
