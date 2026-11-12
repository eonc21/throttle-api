import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FooController } from './foo.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [FooController],
})
export class FooModule {}
