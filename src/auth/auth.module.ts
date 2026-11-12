import { Module } from '@nestjs/common';
import { ClientRegistry } from './client-registry.js';

@Module({
  providers: [ClientRegistry],
  exports: [ClientRegistry],
})
export class AuthModule {}
