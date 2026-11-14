import { Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

const COMMAND_TIMEOUT_MS = 500;

export function createRedisClient(redisUrl: string): Redis {
  const logger = new Logger('RedisClient');
  const redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    commandTimeout: COMMAND_TIMEOUT_MS,
  });

  redisClient.on('error', (error: Error) => {
    logger.warn(`Redis error: ${error.message}`);
  });

  return redisClient;
}
