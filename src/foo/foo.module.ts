import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FixedWindowRateLimiter } from '../rate-limit/limiters/fixed-window-rate-limiter.js';
import { RateLimitStoreModule } from '../rate-limit/rate-limit-store.module.js';
import { RateLimiter } from '../rate-limit/limiters/rate-limiter.js';
import { FooController } from './foo.controller.js';

@Module({
  imports: [AuthModule, RateLimitStoreModule],
  controllers: [FooController],
  providers: [{ provide: RateLimiter, useClass: FixedWindowRateLimiter }],
})
export class FooModule {}
