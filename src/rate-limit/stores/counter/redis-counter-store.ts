import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
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

  async increment(key: string, ttlMs: number): Promise<number> {
    const redisReply = await this.redisClient.eval(
      INCREMENT_COUNTER_WITH_EXPIRY_SCRIPT,
      NUMBER_OF_KEYS_PASSED_TO_SCRIPT,
      key,
      ttlMs,
    );

    return Number(redisReply);
  }

  async get(key: string): Promise<number> {
    const redisReply = await this.redisClient.get(key);

    return Number(redisReply ?? 0);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
