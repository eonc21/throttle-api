import { Test, TestingModule } from '@nestjs/testing';
import { FooController } from './foo.controller.js';
import { FooService } from './foo.service.js';

describe('FooController', () => {
  let fooController: FooController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FooController],
      providers: [FooService],
    }).compile();

    fooController = app.get<FooController>(FooController);
  });

  describe('foo', () => {
    it('should return { success: true }', () => {
      expect(fooController.get()).toEqual({ success: true });
    });
  });
});
