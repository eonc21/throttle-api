import { Injectable } from '@nestjs/common';

@Injectable()
export class FooService {
  get(): { success: boolean } {
    return { success: true };
  }
}
