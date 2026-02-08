import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MessagingModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1h') as JwtSignOptions['expiresIn'],
          issuer: config.get<string>('JWT_ISSUER') ?? 'delivery-platform',
          audience:
            config.get<string>('JWT_AUDIENCE') ?? 'delivery-platform-app',
        } satisfies JwtSignOptions,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService],
  exports: [JwtModule, AuthService, RefreshTokenService],
})
export class AuthModule {}
