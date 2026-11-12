import { HttpException, HttpStatus } from '@nestjs/common';

export class RateLimitExceededException extends HttpException {
  constructor() {
    super({ error: 'rate limit exceeded' }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
