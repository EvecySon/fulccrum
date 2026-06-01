import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payment (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /payment/webhook', () => {
    it('should reject invalid webhook signature', async () => {
      const payload = {
        event: 'charge.success',
        data: { reference: 'test-ref', amount: 100000 },
      };

      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('x-paystack-signature', 'invalid-signature')
        .send(payload)
        .expect(400);
    });

    it('should be accessible without JWT (no auth guard)', async () => {
      const payload = {
        event: 'charge.success',
        data: { reference: 'test-ref', amount: 100000 },
      };

      // Should not return 401 (Unauthorized) — only 400 for bad signature
      const res = await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('x-paystack-signature', 'fake-sig')
        .send(payload);

      expect(res.status).not.toBe(401);
    });
  });

  describe('GET /payment/history (protected)', () => {
    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/payment/history')
        .expect(401);
    });
  });

  describe('POST /payment/initialize (protected)', () => {
    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .post('/payment/initialize')
        .send({ orderId: 'fake', amount: 1000 })
        .expect(401);
    });
  });

  describe('GET /payment/cards (protected)', () => {
    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/payment/cards')
        .expect(401);
    });
  });
});
