import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module.js';
import { FooController } from './foo.controller.js';

describe('FooController', () => {
  let fooController: FooController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [FooController],
    }).compile();

    fooController = app.get<FooController>(FooController);
  });

  describe('foo', () => {
    it('should return { success: true }', () => {
      expect(fooController.get()).toEqual({ success: true });
    });
  });
});
