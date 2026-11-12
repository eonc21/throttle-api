import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { BarModule } from './../src/bar/bar.module.js';

describe('Bar Functionality (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BarModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/bar (GET)', () => {
    return request(app.getHttpServer())
      .get('/bar')
      .expect(200)
      .expect({ success: true });
  });

  afterEach(async () => {
    await app.close();
  });
});
