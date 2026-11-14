import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CounterStore } from './stores/counter/counter-store.js';
import { createCounterStore } from './stores/counter/create-counter-store.js';
import { parseStoreBackend } from './stores/store-backend.js';

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

@Module({
  providers: [
    {
      provide: CounterStore,
      inject: [ConfigService],
      useFactory: (config: ConfigService): CounterStore =>
        createCounterStore(
          parseStoreBackend(config.get<string>('RATE_LIMIT_STORE')),
          config.get<string>('REDIS_URL', DEFAULT_REDIS_URL),
        ),
    },
  ],
  exports: [CounterStore],
})
export class RateLimitStoreModule {}
