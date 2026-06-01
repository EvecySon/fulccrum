import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return OK status', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /health/database', () => {
    it('should check database connectivity', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/database')
        .expect(200);

      expect(res.body.service).toBe('database');
      expect(res.body).toHaveProperty('healthy');
    });
  });

  describe('GET /health/all', () => {
    it('should return all services health', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/all')
        .expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('services');
      expect(res.body.services).toHaveProperty('cache');
      expect(res.body.services).toHaveProperty('database');
    });
  });
});
