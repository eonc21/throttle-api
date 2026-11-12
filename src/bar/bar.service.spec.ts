import { BarService } from './bar.service.js';

describe('BarService', () => {
  let barService: BarService;

  beforeEach(() => {
    barService = new BarService();
  });

  it('should be defined', () => {
    expect(barService).toBeDefined();
  });

  describe('get', () => {
    it('should return { success: true }', () => {
      expect(barService.get()).toEqual({ success: true });
    });
  });
});
