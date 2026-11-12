import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { FooModule } from './../src/foo/foo.module.js';

describe('Foo Functionality (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FooModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/foo (GET)', () => {
    return request(app.getHttpServer())
      .get('/foo')
      .expect(200)
      .expect({ success: true });
  });

  afterEach(async () => {
    await app.close();
  });
});
