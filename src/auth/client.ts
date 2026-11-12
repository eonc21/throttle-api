export interface RateLimit {
  limit: number;
  windowSeconds: number;
}

export interface Client {
  id: string;
  rateLimit: RateLimit;
}
