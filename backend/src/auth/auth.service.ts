import { ConflictException, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { EmailService } from '../messaging/email.service';
import { TermiiService } from '../messaging/termii.service';
import { PaystackService } from '../payment/paystack.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly emailService: EmailService,
    private readonly termiiService: TermiiService,
    private readonly paystackService: PaystackService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'customer',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    const accessToken = await this.signAccessToken(user.id, user.role);
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = await this.signAccessToken(user.id, user.role);
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, phone: true, firstName: true },
    });

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a reset code has been sent',
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        resetToken,
        expiresAt,
      },
    });

    console.log(`[PASSWORD RESET] OTP for ${user.email}: ${otp}`);
    console.log(`[PASSWORD RESET] Reset token: ${resetToken}`);

    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, otp, resetToken);

    if (user.phone) {
      await this.termiiService.sendSMS(
        user.phone,
        `Your Fulccrum password reset code is: ${otp}. Valid for 10 minutes.`,
      );
    }

    return {
      success: true,
      message: 'Password reset code sent to your email and phone',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetRequest = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        otp: dto.otp,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRequest) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      success: true,
      resetToken: resetRequest.resetToken,
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetRequest = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        resetToken: dto.resetToken,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRequest) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { isUsed: true },
      }),
    ]);

    await this.refreshTokenService.revokeAllUserTokens(user.id);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async refreshAccessToken(dto: RefreshTokenDto) {
    const userId = await this.refreshTokenService.validateRefreshToken(dto.refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    await this.refreshTokenService.revokeRefreshToken(dto.refreshToken);

    const accessToken = await this.signAccessToken(user.id, user.role);
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async initiateRegistrationPayment(dto: RegisterPaymentDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const fee = 5000;

    const payment = await this.paystackService.initializePayment({
      email: dto.email,
      amount: fee * 100,
      metadata: {
        type: 'registration_fee',
        role: dto.role,
      },
      callback_url: process.env.FRONTEND_URL + '/auth/register/complete',
    });

    return {
      authorizationUrl: payment.authorization_url,
      reference: payment.reference,
      amount: fee,
    };
  }

  async verifyRegistrationPayment(reference: string) {
    const payment = await this.paystackService.verifyPayment(reference);

    if (payment.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    if (payment.metadata.type !== 'registration_fee') {
      throw new BadRequestException('Invalid payment type');
    }

    return {
      success: true,
      email: payment.customer.email,
      role: payment.metadata.role,
      amount: payment.amount / 100,
    };
  }

  private async signAccessToken(userId: string, role: string) {
    return this.jwt.signAsync({ sub: userId, role });
  }
}
