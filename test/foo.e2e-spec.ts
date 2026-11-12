import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Foo Functionality (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Authorization failures', () => {
    it('/foo (GET) without an Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/foo')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/foo (GET) with a blank Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', ' ')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/foo (GET) with an unauthorized client id is rejected', () => {
      return request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', 'Bearer unauthorized_client')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/foo (GET) with a malformed Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', 'not-an-authorization-header')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });
  });

  it.each(['authorized_client', 'premium_client'])(
    '/foo (GET) succeeds for client %s',
    async (clientId) => {
      await request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', `Bearer ${clientId}`)
        .expect(200)
        .expect({ success: true });
    },
  );

  describe('Rate limiting', () => {
    const exhaust = async (clientId: string, times: number): Promise<void> => {
      for (let i = 0; i < times; i++) {
        await request(app.getHttpServer())
          .get('/foo')
          .set('Authorization', `Bearer ${clientId}`)
          .expect(200);
      }
    };

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('/foo (GET) is rejected with 429 once the client limit is exceeded', async () => {
      await exhaust('authorized_client', 5);

      await request(app.getHttpServer())
        .get('/foo')
        .set('Authorization', 'Bearer authorized_client')
        .expect(429)
        .expect({ error: 'rate limit exceeded' });
    });

    it('/foo (GET) applies each client its own limit', async () => {
      await exhaust('authorized_client', 5);

      await exhaust('premium_client', 6);
    });

    it('/foo (GET) accepts requests again in the next window', async () => {
      await exhaust('authorized_client', 5);

      vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'));

      await exhaust('authorized_client', 1);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
