import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from '../auth/authorization.guard.js';
import { FooService } from './foo.service.js';

@UseGuards(AuthorizationGuard)
@Controller('/foo')
export class FooController {
  constructor(private readonly fooService: FooService) {}

  @Get()
  get(): { success: boolean } {
    return this.fooService.get();
  }
}
