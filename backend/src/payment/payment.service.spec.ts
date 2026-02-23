import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { IdempotencyService } from '../common/services/idempotency.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentService - Idempotency', () => {
  let service: PaymentService;
  let prisma: PrismaService;
  let idempotencyService: IdempotencyService;

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-001',
    customerId: 'user-123',
    customer: {
      email: 'test@example.com',
    },
    paymentId: null,
    paymentStatus: 'pending',
  };

  const mockPaystackResponse = {
    data: {
      data: {
        authorization_url: 'https://paystack.com/pay/xyz',
        access_code: 'abc123',
        reference: 'ORD-001-1234567890-xyz',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PAYSTACK_SECRET_KEY') return 'sk_test_xxx';
              if (key === 'REDIS_HOST') return 'localhost';
              if (key === 'REDIS_PORT') return 6379;
              return null;
            }),
          },
        },
        {
          provide: PaystackService,
          useValue: {},
        },
        {
          provide: IdempotencyService,
          useValue: {
            generateKey: jest.fn((prefix, ...parts) => `${prefix}:${parts.join(':')}`),
            execute: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    idempotencyService = module.get<IdempotencyService>(IdempotencyService);
  });

  describe('initializePayment with idempotency', () => {
    it('should initialize payment successfully on first request', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const amount = 5000;

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue(mockOrder as any);
      
      // Mock idempotency service to execute the function
      jest.spyOn(idempotencyService, 'execute').mockImplementation(async (key, fn) => {
        const result = await fn();
        return { cached: false, data: result };
      });

      // Mock axios call
      const axiosMock = jest.spyOn(require('axios'), 'post').mockResolvedValue(mockPaystackResponse);

      const result = await service.initializePayment(userId, orderId, amount);

      expect(result).toHaveProperty('authorizationUrl');
      expect(result).toHaveProperty('reference');
      expect(idempotencyService.execute).toHaveBeenCalled();
      expect(axiosMock).toHaveBeenCalledTimes(1);
    });

    it('should return cached response for duplicate request', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const amount = 5000;
      const idempotencyKey = 'payment:user-123:order-123';

      const cachedResponse = {
        authorizationUrl: 'https://paystack.com/pay/xyz',
        accessCode: 'abc123',
        reference: 'ORD-001-1234567890-xyz',
        idempotencyKey,
      };

      // Mock idempotency service to return cached result
      jest.spyOn(idempotencyService, 'execute').mockResolvedValue({
        cached: true,
        data: cachedResponse,
      });

      const axiosMock = jest.spyOn(require('axios'), 'post');

      const result = await service.initializePayment(userId, orderId, amount, idempotencyKey);

      expect(result).toEqual(cachedResponse);
      expect(axiosMock).not.toHaveBeenCalled(); // Should not call Paystack
      expect(idempotencyService.execute).toHaveBeenCalledWith(
        idempotencyKey,
        expect.any(Function),
      );
    });

    it('should prevent payment for already paid order', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const amount = 5000;

      const paidOrder = {
        ...mockOrder,
        paymentId: 'REF-123',
        paymentStatus: 'paid',
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(paidOrder as any);
      
      jest.spyOn(idempotencyService, 'execute').mockImplementation(async (key, fn) => {
        const result = await fn();
        return { cached: false, data: result };
      });

      await expect(service.initializePayment(userId, orderId, amount)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate unique payment references', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const amount = 5000;

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue(mockOrder as any);
      
      const references: string[] = [];
      
      jest.spyOn(idempotencyService, 'execute').mockImplementation(async (key, fn) => {
        const result = await fn();
        return { cached: false, data: result };
      });

      jest.spyOn(require('axios'), 'post').mockImplementation((url, data: any) => {
        references.push(data.reference);
        return Promise.resolve(mockPaystackResponse);
      });

      // Make 3 payment initializations
      await service.initializePayment(userId, orderId, amount);
      await service.initializePayment(userId, orderId, amount);
      await service.initializePayment(userId, orderId, amount);

      // All references should be unique
      const uniqueReferences = new Set(references);
      expect(uniqueReferences.size).toBe(3);
      
      // All should follow the pattern ORD-{orderNumber}-{timestamp}-{random}
      references.forEach(ref => {
        expect(ref).toMatch(/^ORD-ORD-001-\d+-[a-z0-9]+$/);
      });
    });
  });

  describe('IdempotencyService', () => {
    it('should generate unique idempotency keys', () => {
      const key1 = idempotencyService.generateKey('payment', 'user-1', 'order-1');
      const key2 = idempotencyService.generateKey('payment', 'user-1', 'order-1');

      expect(key1).not.toEqual(key2); // Should be unique due to timestamp and random
      expect(key1).toContain('payment:user-1:order-1');
    });
  });
});
