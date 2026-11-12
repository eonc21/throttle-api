import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from '../auth/authorization.guard.js';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard.js';
import type { SuccessResponse } from '../common/success-response.js';

@UseGuards(AuthorizationGuard, RateLimitGuard)
@Controller('/foo')
export class FooController {
  @Get()
  get(): SuccessResponse {
    return { success: true };
  }
}
