import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from '../auth/authorization.guard.js';
import type { SuccessResponse } from '../common/success-response.js';

@UseGuards(AuthorizationGuard)
@Controller('/bar')
export class BarController {
  @Get()
  get(): SuccessResponse {
    return { success: true };
  }
}
