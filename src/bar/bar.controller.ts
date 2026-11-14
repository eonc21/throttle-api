import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from '../auth/authorization.guard.js';
import type { SuccessResponse } from '../common/success-response.js';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard.js';

@UseGuards(AuthorizationGuard, RateLimitGuard)
@Controller('/bar')
export class BarController {
  @Get()
  get(): SuccessResponse {
    return { success: true };
  }
}
