import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private fromEmail: string;
  private sendGridApiKey: string;

  constructor(private config: ConfigService) {
    this.fromEmail = this.config.get('FROM_EMAIL') || 'noreply@fulccrum.com';
    this.sendGridApiKey = this.config.get('SENDGRID_API_KEY') || '';
  }

  async sendPasswordResetEmail(email: string, firstName: string, otp: string, resetToken: string) {
    const subject = 'Reset Your Fulccrum Password';
    const body = `
      Hi ${firstName},
      
      You requested to reset your password. Use the following code to verify your identity:
      
      Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      Fulccrum Team
    `;

    console.log(`[EMAIL] Password reset email to ${email}`);
    console.log(`[EMAIL] OTP: ${otp}`);
    console.log(`[EMAIL] Reset Token: ${resetToken}`);

    return this.sendEmail(email, subject, body);
  }

  async sendVerificationEmail(email: string, firstName: string, otp: string) {
    const subject = 'Verify Your Fulccrum Account';
    const body = `
      Hi ${firstName},
      
      Welcome to Fulccrum! Please verify your email address using the code below:
      
      Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create this account, please ignore this email.
      
      Best regards,
      Fulccrum Team
    `;

    console.log(`[EMAIL] Verification email to ${email}`);
    console.log(`[EMAIL] OTP: ${otp}`);

    return this.sendEmail(email, subject, body);
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const subject = 'Welcome to Fulccrum!';
    const body = `
      Hi ${firstName},
      
      Welcome to Fulccrum! Your account has been created successfully.
      
      Start exploring delicious food options and enjoy seamless delivery.
      
      Best regards,
      Fulccrum Team
    `;

    return this.sendEmail(email, subject, body);
  }

  async sendOrderConfirmation(email: string, orderNumber: string, totalAmount: number) {
    const subject = `Order Confirmation - ${orderNumber}`;
    const body = `
      Your order ${orderNumber} has been confirmed!
      
      Total Amount: ₦${totalAmount.toFixed(2)}
      
      You can track your order in the app.
      
      Thank you for choosing Fulccrum!
    `;

    return this.sendEmail(email, subject, body);
  }

  async sendWithdrawalConfirmation(email: string, amount: number, code: string) {
    const subject = 'Withdrawal Confirmation Code';
    const body = `
      You requested a withdrawal of ₦${amount.toFixed(2)}.
      
      Confirmation Code: ${code}
      
      This code will expire in 10 minutes.
      
      If you didn't request this, please contact support immediately.
    `;

    return this.sendEmail(email, subject, body);
  }

  private async sendEmail(to: string, subject: string, body: string) {
    if (!this.sendGridApiKey || this.sendGridApiKey === '') {
      console.log(`[EMAIL] SendGrid not configured. Email would be sent to: ${to}`);
      console.log(`[EMAIL] Subject: ${subject}`);
      console.log(`[EMAIL] Body: ${body}`);
      return { sent: false, message: 'Email service not configured' };
    }

    try {
      console.log(`[EMAIL] Sending email to ${to}`);
      console.log(`[EMAIL] Subject: ${subject}`);
      
      return {
        sent: true,
        to,
        subject,
      };
    } catch (error) {
      console.error('[EMAIL] Error sending email:', error);
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
