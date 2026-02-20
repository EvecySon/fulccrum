import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface IdempotencyResult<T = any> {
  cached: boolean;
  data: T;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly redis: Redis;
  private readonly ttl: number = 172800; // 48 hours in seconds

  constructor(private readonly config: ConfigService) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  /**
   * Generate a unique idempotency key
   */
  generateKey(prefix: string, ...parts: string[]): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}:${parts.join(':')}:${timestamp}:${random}`;
  }

  /**
   * Check if an idempotency key exists and return cached result
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(`idempotency:${key}`);
      if (cached) {
        this.logger.log(`Idempotency hit for key: ${key}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to get idempotency key ${key}:`, error);
      // On Redis failure, return null to allow operation to proceed
      return null;
    }
  }

  /**
   * Store a result with idempotency key
   */
  async set<T = any>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.ttl;
      await this.redis.setex(
        `idempotency:${key}`,
        ttl,
        JSON.stringify(data),
      );
      this.logger.log(`Stored idempotency key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to set idempotency key ${key}:`, error);
      // Don't throw - idempotency is a safety feature, not critical path
    }
  }

  /**
   * Execute a function with idempotency protection
   */
  async execute<T = any>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<IdempotencyResult<T>> {
    // Check if already processed
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return { cached: true, data: cached };
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttlSeconds);

    return { cached: false, data: result };
  }

  /**
   * Delete an idempotency key (for testing or manual intervention)
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(`idempotency:${key}`);
      this.logger.log(`Deleted idempotency key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete idempotency key ${key}:`, error);
    }
  }

  /**
   * Check if Redis is available
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get statistics about idempotency usage
   */
  async getStats(): Promise<{
    totalKeys: number;
    healthy: boolean;
  }> {
    try {
      const keys = await this.redis.keys('idempotency:*');
      const healthy = await this.isHealthy();
      return {
        totalKeys: keys.length,
        healthy,
      };
    } catch (error) {
      this.logger.error('Failed to get idempotency stats:', error);
      return {
        totalKeys: 0,
        healthy: false,
      };
    }
  }

  /**
   * Cleanup expired keys (optional - Redis handles this automatically)
   */
  async cleanup(): Promise<number> {
    try {
      const keys = await this.redis.keys('idempotency:*');
      let deleted = 0;
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key has no expiry, delete it
          await this.redis.del(key);
          deleted++;
        }
      }
      
      this.logger.log(`Cleaned up ${deleted} idempotency keys`);
      return deleted;
    } catch (error) {
      this.logger.error('Failed to cleanup idempotency keys:', error);
      return 0;
    }
  }

  /**
   * Close Redis connection (for graceful shutdown)
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
