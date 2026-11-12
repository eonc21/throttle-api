import { Controller, Get } from '@nestjs/common';
import { FooService } from './foo.service.js';

@Controller('/foo')
export class FooController {
  constructor(private readonly fooService: FooService) {}

  @Get()
  get(): { success: boolean } {
    return this.fooService.get();
  }
}
