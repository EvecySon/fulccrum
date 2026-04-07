import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TransferRecipient {
  type: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
}

interface InitiateTransferDto {
  amount: number;
  recipient: string;
  reason?: string;
  reference?: string;
}

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get('PAYSTACK_SECRET_KEY') || '';
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(data: {
    email: string;
    amount: number;
    metadata?: any;
    callback_url?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Initialize payment error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Payment initialization failed'
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Verify payment error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Payment verification failed'
      );
    }
  }

  async createTransferRecipient(data: TransferRecipient) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transferrecipient`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Create recipient error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to create transfer recipient'
      );
    }
  }

  async initiateTransfer(data: InitiateTransferDto) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          ...data,
        },
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Transfer error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Transfer failed'
      );
    }
  }

  async verifyTransfer(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transfer/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Verify transfer error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Transfer verification failed'
      );
    }
  }

  async resolveBankAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Resolve account error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Could not resolve bank account'
      );
    }
  }

  async listBanks() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank?country=nigeria`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] List banks error:', error.response?.data);
      return [];
    }
  }

  async chargeAuthorization(data: {
    email: string;
    amount: number;
    authorization_code: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/charge_authorization`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Charge authorization error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Card charge failed'
      );
    }
  }

  async createDedicatedVirtualAccount(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    preferredBank?: string;
  }) {
    try {
      console.log('[PAYSTACK] Creating dedicated virtual account for:', data.email);
      
      const response = await axios.post(
        `${this.baseUrl}/dedicated_account`,
        {
          customer: data.email,
          preferred_bank: data.preferredBank || 'wema-bank',
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        },
        { headers: this.getHeaders() }
      );

      console.log('[PAYSTACK] Virtual account created:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Create virtual account error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to create virtual account'
      );
    }
  }

  async fetchDedicatedVirtualAccount(accountId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/dedicated_account/${accountId}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] Fetch virtual account error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to fetch virtual account'
      );
    }
  }

  async initializeUSSDPayment(data: {
    email: string;
    amount: number;
    bankCode: string;
    metadata?: any;
  }) {
    try {
      console.log('[PAYSTACK] Initializing USSD payment:', data);
      
      const response = await axios.post(
        `${this.baseUrl}/charge`,
        {
          email: data.email,
          amount: data.amount,
          currency: 'NGN',
          channel: 'ussd',
          bank: {
            code: data.bankCode,
          },
          metadata: data.metadata,
        },
        { headers: this.getHeaders() }
      );

      console.log('[PAYSTACK] USSD payment initialized:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[PAYSTACK] USSD payment error:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to initialize USSD payment'
      );
    }
  }
}
