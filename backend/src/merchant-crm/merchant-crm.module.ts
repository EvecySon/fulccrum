import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MerchantCrmService } from './merchant-crm.service';
import { MerchantCrmController } from './merchant-crm.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1h') as JwtSignOptions['expiresIn'],
        } satisfies JwtSignOptions,
      }),
    }),
  ],
  controllers: [MerchantCrmController],
  providers: [MerchantCrmService],
})
export class MerchantCrmModule {}
