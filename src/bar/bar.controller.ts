import { Controller, Get } from '@nestjs/common';
import { BarService } from './bar.service.js';

@Controller('/bar')
export class BarController {
  constructor(private readonly barService: BarService) {}

  @Get()
  get(): { success: boolean } {
    return this.barService.get();
  }
}
