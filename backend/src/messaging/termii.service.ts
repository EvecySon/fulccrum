import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TermiiService {
  private apiKey: string;
  private senderId: string;
  private baseUrl = 'https://api.ng.termii.com/api';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('TERMII_API_KEY') || 'your_termii_api_key';
    this.senderId = this.config.get('TERMII_SENDER_ID') || 'Fulccrum';
  }

  async sendSMS(to: string, message: string) {
    // Development mode: Log SMS instead of sending if API key not configured
    if (!this.apiKey || this.apiKey === 'your_termii_api_key') {
      console.log('='.repeat(60));
      console.log('[TERMII SMS - DEV MODE] SMS would be sent:');
      console.log(`To: ${to}`);
      console.log(`From: ${this.senderId}`);
      console.log(`Message: ${message}`);
      console.log('='.repeat(60));
      return {
        success: true,
        messageId: 'dev_mode_' + Date.now(),
        message: 'SMS logged (dev mode - Termii not configured)',
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sms/send`, {
        to,
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: this.apiKey,
      });

      console.log(`[TERMII SMS] Sent to ${to}: ${message}`);
      return {
        success: true,
        messageId: response.data.message_id,
        message: 'SMS sent successfully',
      };
    } catch (error) {
      console.error('[TERMII SMS] Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  async sendOTP(phoneNumber: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await this.sendSMS(
      phoneNumber,
      `Your Fulccrum verification code is: ${otp}. Valid for 10 minutes.`
    );

    return { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
  }

  async sendOrderNotification(phoneNumber: string, orderNumber: string, status: string) {
    const messages: Record<string, string> = {
      accepted: `Your order ${orderNumber} has been accepted and is being prepared.`,
      preparing: `Your order ${orderNumber} is being prepared by the restaurant.`,
      ready: `Your order ${orderNumber} is ready for pickup!`,
      picked_up: `Your order ${orderNumber} is on the way! Track your delivery in the app.`,
      in_transit: `Your order ${orderNumber} will arrive soon!`,
      delivered: `Your order ${orderNumber} has been delivered. Enjoy your meal!`,
      cancelled: `Your order ${orderNumber} has been cancelled.`,
    };

    const message = messages[status] || `Order ${orderNumber} status: ${status}`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendWithdrawalCode(phoneNumber: string, code: string, amount: number) {
    const message = `Your withdrawal confirmation code is: ${code}. Amount: ₦${amount.toFixed(2)}. Valid for 10 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendWelcomeSMS(phoneNumber: string, firstName: string) {
    const message = `Welcome to Fulccrum, ${firstName}! Your account has been created successfully. Start ordering delicious food now!`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendDriverAssignment(phoneNumber: string, orderNumber: string, driverName: string) {
    const message = `${driverName} has been assigned to deliver your order ${orderNumber}. You can track the delivery in real-time.`;
    return this.sendSMS(phoneNumber, message);
  }
}
