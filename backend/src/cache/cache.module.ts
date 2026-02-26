import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL');

        // Use Redis in production if REDIS_URL is set
        if (redisUrl) {
          try {
            // @ts-ignore - optional dependency, only used when REDIS_URL is set
            const { redisStore } = await import('cache-manager-ioredis-yet');
            const store = await redisStore({
              url: redisUrl,
              ttl: 300, // 5 minutes default
            });
            return {
              store,
              ttl: 300,
            } as any;
          } catch (error) {
            console.warn('Redis connection failed, falling back to in-memory cache:', error.message);
            // Fall back to in-memory cache
            return {
              ttl: 300,
              max: 100,
            } as any;
          }
        }

        // Use in-memory cache for development
        return {
          ttl: 300, // 5 minutes
          max: 100, // Maximum number of items in cache
        } as any;
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
