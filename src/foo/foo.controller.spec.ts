import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module.js';
import { FixedWindowRateLimiter } from '../rate-limit/limiters/fixed-window-rate-limiter.js';
import { InMemoryCounterStore } from '../rate-limit/stores/counter/in-memory-counter-store.js';
import { CounterStore } from '../rate-limit/stores/counter/counter-store.js';
import { RateLimiter } from '../rate-limit/limiters/rate-limiter.js';
import { FooController } from './foo.controller.js';

describe('FooController', () => {
  let fooController: FooController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [FooController],
      providers: [
        { provide: CounterStore, useClass: InMemoryCounterStore },
        { provide: RateLimiter, useClass: FixedWindowRateLimiter },
      ],
    }).compile();

    fooController = app.get<FooController>(FooController);
  });

  describe('foo', () => {
    it('should return { success: true }', () => {
      expect(fooController.get()).toEqual({ success: true });
    });
  });
});
