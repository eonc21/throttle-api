import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RateLimitStoreUnavailableError } from '../rate-limit-store-unavailable.error.js';
import { CounterStore } from './counter-store.js';

const INCREMENT_COUNTER_WITH_EXPIRY_SCRIPT = `
local counterKey = KEYS[1]
local ttlMs = ARGV[1]
local requestCount = redis.call('INCR', counterKey)
if requestCount == 1 then
  redis.call('PEXPIRE', counterKey, ttlMs)
end
return requestCount
`;

const NUMBER_OF_KEYS_PASSED_TO_SCRIPT = 1;

@Injectable()
export class RedisCounterStore
  extends CounterStore
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly redisClient: Redis) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const isConnectionNotStartedYet = this.redisClient.status === 'wait';

    if (isConnectionNotStartedYet) {
      await this.redisClient.connect();
    }
  }

  async increment(key: string, timeToLiveMs: number): Promise<number> {
    try {
      const redisReply = await this.redisClient.eval(
        INCREMENT_COUNTER_WITH_EXPIRY_SCRIPT,
        NUMBER_OF_KEYS_PASSED_TO_SCRIPT,
        key,
        timeToLiveMs,
      );

      return Number(redisReply);
    } catch (error) {
      throw new RateLimitStoreUnavailableError(error);
    }
  }

  async get(key: string): Promise<number> {
    try {
      const redisReply = await this.redisClient.get(key);

      return Number(redisReply ?? 0);
    } catch (error) {
      throw new RateLimitStoreUnavailableError(error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redisClient.quit();
    } catch {
      this.redisClient.disconnect();
    }
  }
}
