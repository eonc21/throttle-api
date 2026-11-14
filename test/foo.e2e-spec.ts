import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

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

  // just a basic test to test that the rate limiting is applied on foo
  // but the real tests are inside the rate-limiting.e2e-spec.ts file
  describe('Rate limiting', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('/foo (GET) is rate limited: a client sending too many requests gets 429', async () => {
      const statuses: number[] = [];

      // note to self, this might break if the limit changes
      // another note to self, this is flaky when you also make requests with curl/Postman yourself
      for (let i = 0; i < 10; i++) {
        const { status } = await request(app.getHttpServer())
          .get('/foo')
          .set('Authorization', 'Bearer authorized_client');
        statuses.push(status);
      }

      expect(statuses[0]).toBe(200);
      expect(statuses).toContain(429);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
