import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

const REDIS_URL = 'redis://localhost:6379/1';

describe.each([
  { store: 'memory', storedKeys: 0, statusAfterRestart: 200 },
  { store: 'redis', storedKeys: 1, statusAfterRestart: 429 },
])(
  '/foo rate limiting with the $store store',
  ({ store, storedKeys, statusAfterRestart }) => {
    let app: INestApplication<App>;
    let redis: Redis;

    const startApp = async (): Promise<void> => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
    };

    const getFoo = (clientId: string) =>
      request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', `Bearer ${clientId}`);

    const exhaust = async (clientId: string, times: number): Promise<void> => {
      for (let i = 0; i < times; i++) {
        await getFoo(clientId).expect(200);
      }
    };

    beforeAll(() => {
      redis = new Redis(REDIS_URL);
    });

    afterAll(async () => {
      await redis.quit();
    });

    beforeEach(async () => {
      process.env.RATE_LIMIT_STORE = store;
      process.env.REDIS_URL = REDIS_URL;
      await redis.flushdb();
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      await startApp();
    });

    afterEach(async () => {
      await app.close();
      vi.useRealTimers();
      delete process.env.RATE_LIMIT_STORE;
      delete process.env.REDIS_URL;
    });

    it('is rejected with 429 once the client limit is exceeded', async () => {
      await exhaust('authorized_client', 5);

      await getFoo('authorized_client')
        .expect(429)
        .expect({ error: 'rate limit exceeded' });
    });

    it('applies each client its own limit', async () => {
      await exhaust('authorized_client', 5);

      await exhaust('premium_client', 6);
    });

    it('keeps the counters only in the chosen store', async () => {
      await exhaust('authorized_client', 5);

      expect(await redis.dbsize()).toBe(storedKeys);
    });

    it(`answers ${statusAfterRestart} after an app restart`, async () => {
      await exhaust('authorized_client', 5);

      await app.close();
      await startApp();

      await getFoo('authorized_client').expect(statusAfterRestart);
    });
  },
);

describe('rate limit store configuration', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_STORE;
    delete process.env.REDIS_URL;
  });

  it('refuses to start when the redis store is unreachable', async () => {
    process.env.RATE_LIMIT_STORE = 'redis';
    process.env.REDIS_URL = 'redis://localhost:1';
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();

    await expect(app.init()).rejects.toThrow();
    await app.close();
  });
});
