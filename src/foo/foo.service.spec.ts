import { FooService } from './foo.service.js';

describe('FooService', () => {
  let fooService: FooService;

  beforeEach(() => {
    fooService = new FooService();
  });

  it('should be defined', () => {
    expect(fooService).toBeDefined();
  });

  describe('get', () => {
    it('should return { success: true }', () => {
      expect(fooService.get()).toEqual({ success: true });
    });
  });
});
