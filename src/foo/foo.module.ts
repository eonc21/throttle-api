import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FixedWindowRateLimiter } from '../rate-limit/fixed-window-rate-limiter.js';
import { InMemoryRateLimitStore } from '../rate-limit/in-memory-rate-limit-store.js';
import { RateLimitStore } from '../rate-limit/rate-limit-store.js';
import { RateLimiter } from '../rate-limit/rate-limiter.js';
import { FooController } from './foo.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [FooController],
  providers: [
    { provide: RateLimitStore, useClass: InMemoryRateLimitStore },
    { provide: RateLimiter, useClass: FixedWindowRateLimiter },
  ],
})
export class FooModule {}
