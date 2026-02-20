import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdempotencyService } from './services/idempotency.service';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [IdempotencyService, CacheService],
  exports: [IdempotencyService, CacheService],
})
export class CommonModule {}
