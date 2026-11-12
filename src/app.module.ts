import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BarModule } from './bar/bar.module.js';
import { FooModule } from './foo/foo.module.js';

@Module({
  imports: [FooModule, BarModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
