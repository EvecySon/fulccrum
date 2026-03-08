import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdempotencyService } from './services/idempotency.service';
import { CacheService } from './services/cache.service';
import { NonceService } from './services/nonce.service';
import { NonceGuard } from './guards/nonce.guard';
import { NonceController } from './nonce.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [NonceController],
  providers: [IdempotencyService, CacheService, NonceService, NonceGuard],
  exports: [IdempotencyService, CacheService, NonceService, NonceGuard],
})
export class CommonModule {}
