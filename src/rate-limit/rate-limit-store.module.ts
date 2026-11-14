import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRateLimitStore } from './stores/create-rate-limit-store.js';
import { RateLimitStore } from './stores/rate-limit-store.js';

@Module({
  providers: [
    {
      provide: RateLimitStore,
      inject: [ConfigService],
      useFactory: (config: ConfigService): RateLimitStore =>
        createRateLimitStore(
          config.get<string>('RATE_LIMIT_STORE'),
          config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        ),
    },
  ],
  exports: [RateLimitStore],
})
export class RateLimitStoreModule {}
