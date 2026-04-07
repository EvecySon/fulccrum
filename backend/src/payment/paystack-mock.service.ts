import { Injectable } from '@nestjs/common';

/**
 * Mock Paystack Service for Development
 * Returns fake successful responses without calling real Paystack API
 * 
 * TO USE REAL PAYSTACK:
 * 1. Get keys from https://dashboard.paystack.com
 * 2. Update .env with real PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY
 * 3. Replace PaystackMockService with PaystackService in payment.module.ts
 */
@Injectable()
export class PaystackMockService {
  async initializePayment(data: {
    email: string;
    amount: number;
    metadata?: any;
    callback_url?: string;
  }) {
    console.log('[MOCK PAYSTACK] Initializing payment:', data);
    
    // Generate fake reference
    const reference = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Return fake successful response
    return {
      authorization_url: `http://localhost:3000/mock-paystack?reference=${reference}&email=${data.email}&amount=${data.amount}`,
      access_code: `mock_access_${Math.random().toString(36).substr(2, 9)}`,
      reference,
    };
  }

  async verifyPayment(reference: string) {
    console.log('[MOCK PAYSTACK] Verifying payment:', reference);
    
    // Always return success for mock
    return {
      status: true,
      message: 'Verification successful',
      data: {
        status: 'success',
        reference,
        amount: 5000,
        currency: 'NGN',
        paid_at: new Date().toISOString(),
        authorization: {
          authorization_code: `AUTH_${Math.random().toString(36).substr(2, 9)}`,
          card_type: 'visa',
          last4: '4081',
          exp_month: '12',
          exp_year: '2027',
          bank: 'Test Bank',
          reusable: true,
        },
      },
    };
  }

  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number;
  }) {
    console.log('[MOCK PAYSTACK] Charging authorization:', data);
    
    return {
      status: true,
      message: 'Charge successful',
      data: {
        status: 'success',
        reference: `CHG_${Date.now()}`,
        amount: data.amount,
      },
    };
  }
}
