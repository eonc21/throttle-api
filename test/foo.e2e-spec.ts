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

  afterEach(async () => {
    await app.close();
  });
});
