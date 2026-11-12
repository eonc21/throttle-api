import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module.js';
import { FixedWindowRateLimiter } from '../rate-limit/fixed-window-rate-limiter.js';
import { InMemoryRateLimitStore } from '../rate-limit/in-memory-rate-limit-store.js';
import { RateLimitStore } from '../rate-limit/rate-limit-store.js';
import { RateLimiter } from '../rate-limit/rate-limiter.js';
import { FooController } from './foo.controller.js';

describe('FooController', () => {
  let fooController: FooController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [FooController],
      providers: [
        { provide: RateLimitStore, useClass: InMemoryRateLimitStore },
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
