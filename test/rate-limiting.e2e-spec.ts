import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

const TEST_REDIS_URL = 'redis://localhost:6379/1';
const UNREACHABLE_REDIS_URL = 'redis://localhost:1';
const WINDOW_START = new Date('2026-01-01T00:00:00.000Z');

const AUTHORIZED_CLIENT = 'authorized_client';
const PREMIUM_CLIENT = 'premium_client';
const AUTHORIZED_CLIENT_LIMIT = 5;

function configureRateLimitStore(store: string, redisUrl: string): void {
  process.env.RATE_LIMIT_STORE = store;
  process.env.REDIS_URL = redisUrl;
}

function resetRateLimitStoreConfiguration(): void {
  delete process.env.RATE_LIMIT_STORE;
  delete process.env.REDIS_URL;
}

async function createApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return moduleFixture.createNestApplication();
}

describe.each([
  { endpoint: '/foo', statusAtNextWindowStart: 200 },
  { endpoint: '/bar', statusAtNextWindowStart: 429 },
])('$endpoint rate limiting', ({ endpoint, statusAtNextWindowStart }) => {
  describe.each([
    {
      store: 'memory',
      expectedRedisKeyCount: 0,
      restartOutcome: 'forgets the counters',
      expectedStatusAfterRestart: 200,
    },
    {
      store: 'redis',
      expectedRedisKeyCount: 1,
      restartOutcome: 'remembers the counters',
      expectedStatusAfterRestart: 429,
    },
  ])(
    'with the $store store',
    ({
      store,
      expectedRedisKeyCount,
      restartOutcome,
      expectedStatusAfterRestart,
    }) => {
      let app: INestApplication<App>;
      let redis: Redis;

      const startApp = async (): Promise<void> => {
        app = await createApp();
        await app.init();
      };

      const requestEndpoint = (clientId: string) =>
        request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${clientId}`);

      const sendAllowedRequests = async (
        clientId: string,
        requestCount: number,
      ): Promise<void> => {
        for (let i = 0; i < requestCount; i++) {
          await requestEndpoint(clientId).expect(200);
        }
      };

      const useUpAuthorizedClientLimit = (): Promise<void> =>
        sendAllowedRequests(AUTHORIZED_CLIENT, AUTHORIZED_CLIENT_LIMIT);

      beforeAll(() => {
        redis = new Redis(TEST_REDIS_URL);
      });

      afterAll(async () => {
        await redis.quit();
      });

      beforeEach(async () => {
        configureRateLimitStore(store, TEST_REDIS_URL);
        await redis.flushdb();
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(WINDOW_START);
        await startApp();
      });

      afterEach(async () => {
        await app.close();
        vi.useRealTimers();
        resetRateLimitStoreConfiguration();
      });

      it('rejects the request after the limit with 429 and an error body', async () => {
        await useUpAuthorizedClientLimit();

        await requestEndpoint(AUTHORIZED_CLIENT)
          .expect(429)
          .expect({ error: 'rate limit exceeded' });
      });

      it('keeps counting each client separately, so another client is not affected', async () => {
        await useUpAuthorizedClientLimit();

        await sendAllowedRequests(PREMIUM_CLIENT, AUTHORIZED_CLIENT_LIMIT + 1);
      });

      it('writes counters to Redis only when the redis store is chosen', async () => {
        await useUpAuthorizedClientLimit();

        expect(await redis.dbsize()).toBe(expectedRedisKeyCount);
      });

      it(`answers ${statusAtNextWindowStart} right at the start of the next window`, async () => {
        vi.setSystemTime(new Date('2026-01-01T00:00:59.999Z'));
        await useUpAuthorizedClientLimit();

        vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'));

        await requestEndpoint(AUTHORIZED_CLIENT).expect(
          statusAtNextWindowStart,
        );
      });

      it(`${restartOutcome} after an app restart (status ${expectedStatusAfterRestart})`, async () => {
        await useUpAuthorizedClientLimit();

        await app.close();
        await startApp();

        await requestEndpoint(AUTHORIZED_CLIENT).expect(
          expectedStatusAfterRestart,
        );
      });
    },
  );
});

describe('app start-up with the redis store', () => {
  afterEach(() => {
    resetRateLimitStoreConfiguration();
  });

  it('refuses to start when Redis is unreachable', async () => {
    configureRateLimitStore('redis', UNREACHABLE_REDIS_URL);
    const app = await createApp();

    await expect(app.init()).rejects.toThrow();

    await app.close();
  });
});
