import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BarController } from './bar.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [BarController],
})
export class BarModule {}
