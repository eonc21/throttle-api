import { Module } from '@nestjs/common';
import { FooController } from './foo.controller.js';
import { FooService } from './foo.service.js';

@Module({
  imports: [],
  controllers: [FooController],
  providers: [FooService],
})
export class FooModule {}
