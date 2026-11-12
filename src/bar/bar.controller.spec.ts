import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module.js';
import { BarController } from './bar.controller.js';

describe('BarController', () => {
  let barController: BarController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [BarController],
    }).compile();

    barController = app.get<BarController>(BarController);
  });

  describe('bar', () => {
    it('should return { success: true }', () => {
      expect(barController.get()).toEqual({ success: true });
    });
  });
});
