import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from '../auth/authorization.guard.js';
import { BarService } from './bar.service.js';

@UseGuards(AuthorizationGuard)
@Controller('/bar')
export class BarController {
  constructor(private readonly barService: BarService) {}

  @Get()
  get(): { success: boolean } {
    return this.barService.get();
  }
}
