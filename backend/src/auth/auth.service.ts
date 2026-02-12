import { ConflictException, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import axios from 'axios';
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
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AppleLoginDto } from './dto/apple-login.dto';

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
      select: { id: true, emailVerified: true },
    });

    if (existing) {
      if (!existing.emailVerified) {
        throw new ConflictException('Email already registered but not verified. Please check your email for the verification code or request a new one.');
      }
      throw new ConflictException('Email already in use');
    }

    // Check if phone number is already in use
    if (dto.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
        select: { id: true },
      });

      if (phoneExists) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role || 'customer',
          status: 'inactive',
          emailVerified: false,
          phoneVerified: false,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Store OTP in password_resets table (reusing for verification)
      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          otp,
          resetToken: `verify_${Date.now()}`,
          expiresAt,
        },
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.firstName, otp);

      // Send verification SMS if phone provided
      if (user.phone) {
        await this.termiiService.sendSMS(
          user.phone,
          `Welcome to Fulccrum! Your verification code is: ${otp}. Valid for 10 minutes.`,
        );
      }

      return {
        message: 'Registration successful! Please check your email/SMS for the verification code.',
        email: user.email,
        phone: user.phone,
        userId: user.id,
      };
    } catch (error) {
      console.error('[REGISTER ERROR]', error);
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone number already in use');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phone: dto.email },
        ],
      },
    });

    console.log('[LOGIN] Attempting login for:', dto.email);
    console.log('[LOGIN] User found:', user ? { id: user.id, email: user.email, phone: user.phone, status: user.status } : 'NOT FOUND');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account has been deleted
    if (user.status === 'deleted') {
      console.log('[LOGIN] BLOCKED - Account is deleted');
      throw new UnauthorizedException('This account has been deleted and cannot be accessed');
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      throw new UnauthorizedException('This account has been suspended. Please contact support');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('[LOGIN] Account not verified - sending new OTP');
      
      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Store new OTP
      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          otp,
          resetToken: `verify_${Date.now()}`,
          expiresAt,
        },
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.firstName, otp);

      // Send SMS if phone exists
      if (user.phone) {
        await this.termiiService.sendSMS(
          user.phone,
          `Your Fulccrum verification code is: ${otp}. Valid for 10 minutes.`,
        );
      }

      console.log('[LOGIN] New OTP sent to unverified account');

      // Return special response for unverified account
      return {
        verified: false,
        email: user.email,
        phone: user.phone,
        message: 'Please verify your account. A new verification code has been sent to your email.',
      };
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
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

  async verifyRegistration(dto: VerifyRegistrationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, firstName: true, email: true, phone: true, role: true, emailVerified: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Account already verified');
    }

    const verificationRequest = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        otp: dto.otp,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationRequest) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.passwordReset.update({
      where: { id: verificationRequest.id },
      data: { isUsed: true },
    });

    // Activate account
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        phoneVerified: user.phone ? true : false,
        status: 'active',
      },
    });

    // Send welcome message
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);

    if (user.phone) {
      await this.termiiService.sendSMS(
        user.phone,
        `Welcome to Fulccrum, ${user.firstName}! Your account is now active. Start ordering delicious meals today! 🎉`,
      );
    }

    // Generate tokens for automatic login
    const accessToken = await this.signAccessToken(user.id, user.role);
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      message: 'Account verified successfully! Welcome to Fulccrum!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async resendVerificationOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, firstName: true, email: true, phone: true, emailVerified: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Account already verified');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store new OTP
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        resetToken: `verify_${Date.now()}`,
        expiresAt,
      },
    });

    // Resend verification email
    await this.emailService.sendVerificationEmail(user.email, user.firstName, otp);

    // Resend SMS if phone provided
    if (user.phone) {
      await this.termiiService.sendSMS(
        user.phone,
        `Your new Fulccrum verification code is: ${otp}. Valid for 10 minutes.`,
      );
    }

    return {
      message: 'Verification code resent successfully. Please check your email/SMS.',
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

  async googleLogin(dto: GoogleLoginDto) {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`
      );

      const { email, name, picture, sub: googleId } = response.data;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const [firstName, ...lastNameParts] = (name || 'User').split(' ');
        const lastName = lastNameParts.join(' ') || 'User';

        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
            role: 'customer',
            status: 'active',
            avatarUrl: picture,
          },
        });

        await this.emailService.sendWelcomeEmail(email, firstName);
      }

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
    } catch (error) {
      console.error('[GOOGLE LOGIN] Error:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async appleLogin(dto: AppleLoginDto) {
    try {
      const response = await axios.get('https://appleid.apple.com/auth/keys');
      const keys = response.data.keys;

      const decodedToken = this.jwt.decode(dto.identityToken, { complete: true }) as any;
      
      if (!decodedToken) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      const { email, sub: appleId } = decodedToken.payload;

      if (!email) {
        throw new BadRequestException('Email not provided by Apple');
      }

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName: 'Apple',
            lastName: 'User',
            passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
            role: 'customer',
            status: 'active',
          },
        });

        await this.emailService.sendWelcomeEmail(email, 'Apple User');
      }

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
    } catch (error) {
      console.error('[APPLE LOGIN] Error:', error);
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  private async signAccessToken(userId: string, role: string) {
    return this.jwt.signAsync({ sub: userId, role });
  }
}
