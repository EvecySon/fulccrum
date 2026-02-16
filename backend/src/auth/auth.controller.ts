import { Body, Controller, Post, Query, Ip } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('verify-registration')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  verifyRegistration(@Body() dto: VerifyRegistrationDto) {
    return this.auth.verifyRegistration(dto);
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendVerificationOtp(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.auth.login(dto, ip);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshAccessToken(dto);
  }

  @Post('register/payment')
  initiateRegistrationPayment(@Body() dto: RegisterPaymentDto) {
    return this.auth.initiateRegistrationPayment(dto);
  }

  @Post('register/payment/verify')
  verifyRegistrationPayment(@Query('reference') reference: string) {
    return this.auth.verifyRegistrationPayment(reference);
  }

  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.auth.googleLogin(dto);
  }

  @Post('apple')
  appleLogin(@Body() dto: AppleLoginDto) {
    return this.auth.appleLogin(dto);
  }
}
