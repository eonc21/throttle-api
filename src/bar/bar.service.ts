import { Injectable } from '@nestjs/common';

@Injectable()
export class BarService {
  get(): { success: boolean } {
    return { success: true };
  }
}
