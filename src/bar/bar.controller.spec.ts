import { Test, TestingModule } from '@nestjs/testing';
import { BarController } from './bar.controller.js';
import { BarService } from './bar.service.js';

describe('BarController', () => {
  let barController: BarController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BarController],
      providers: [BarService],
    }).compile();

    barController = app.get<BarController>(BarController);
  });

  describe('bar', () => {
    it('should return { success: true }', () => {
      expect(barController.get()).toEqual({ success: true });
    });
  });
});
