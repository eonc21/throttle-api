import { Module } from '@nestjs/common';
import { BarController } from './bar.controller.js';
import { BarService } from './bar.service.js';

@Module({
  imports: [],
  controllers: [BarController],
  providers: [BarService],
})
export class BarModule {}
