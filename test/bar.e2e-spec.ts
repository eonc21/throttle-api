import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Bar Functionality (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Authorization failures', () => {
    it('/bar (GET) without an Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/bar')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/bar (GET) with a blank Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/bar')
        .set('Authorization', ' ')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/bar (GET) with an unauthorized client id is rejected', () => {
      return request(app.getHttpServer())
        .get('/bar')
        .set('Authorization', 'Bearer unauthorized_client')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });

    it('/bar (GET) with a malformed Authorization header is rejected', () => {
      return request(app.getHttpServer())
        .get('/bar')
        .set('Authorization', 'not-an-authorization-header')
        .expect(401)
        .expect(({ body }: { body: { message: string } }) => {
          expect(body.message).toBe('Unauthorized');
        });
    });
  });

  it.each(['authorized_client', 'premium_client'])(
    '/bar (GET) succeeds for client %s',
    async (clientId) => {
      await request(app.getHttpServer())
        .get('/bar')
        .set('Authorization', `Bearer ${clientId}`)
        .expect(200)
        .expect({ success: true });
    },
  );

  afterEach(async () => {
    await app.close();
  });
});
