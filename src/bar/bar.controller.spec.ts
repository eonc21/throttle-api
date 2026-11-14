import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module.js';
import { RateLimiter } from '../rate-limit/limiters/rate-limiter.js';
import { SlidingWindowCounterRateLimiter } from '../rate-limit/limiters/sliding-window-counter-rate-limiter.js';
import { CounterStore } from '../rate-limit/stores/counter/counter-store.js';
import { InMemoryCounterStore } from '../rate-limit/stores/counter/in-memory-counter-store.js';
import { BarController } from './bar.controller.js';

describe('BarController', () => {
  let barController: BarController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [BarController],
      providers: [
        { provide: CounterStore, useClass: InMemoryCounterStore },
        { provide: RateLimiter, useClass: SlidingWindowCounterRateLimiter },
      ],
    }).compile();

    barController = app.get<BarController>(BarController);
  });

  describe('bar', () => {
    it('should return { success: true }', () => {
      expect(barController.get()).toEqual({ success: true });
    });
  });
});
