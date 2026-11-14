import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BarModule } from './bar/bar.module.js';
import { FooModule } from './foo/foo.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FooModule, BarModule],
})
export class AppModule {}
