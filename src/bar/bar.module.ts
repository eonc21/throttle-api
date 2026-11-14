import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RateLimiter } from '../rate-limit/limiters/rate-limiter.js';
import { SlidingWindowCounterRateLimiter } from '../rate-limit/limiters/sliding-window-counter-rate-limiter.js';
import { RateLimitStoreModule } from '../rate-limit/rate-limit-store.module.js';
import { BarController } from './bar.controller.js';

@Module({
  imports: [AuthModule, RateLimitStoreModule],
  controllers: [BarController],
  providers: [
    { provide: RateLimiter, useClass: SlidingWindowCounterRateLimiter },
  ],
})
export class BarModule {}
