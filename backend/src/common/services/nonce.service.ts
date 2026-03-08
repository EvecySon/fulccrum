import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class NonceService {
  private readonly logger = new Logger(NonceService.name);
  private readonly redis: Redis;
  private readonly defaultTTL: number = 300; // 5 minutes

  constructor(private readonly config: ConfigService) {
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
      this.logger.error('Nonce Redis connection error:', err);
    });
  }

  /**
   * Generate a cryptographically secure nonce
   */
  generate(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(16).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Issue a nonce for a specific user and action.
   * The nonce is stored in Redis with a TTL and can only be used once.
   */
  async issue(userId: string, action: string, ttlSeconds?: number): Promise<string> {
    const nonce = this.generate();
    const key = this.redisKey(nonce);
    const ttl = ttlSeconds || this.defaultTTL;

    try {
      await this.redis.setex(key, ttl, JSON.stringify({
        userId,
        action,
        issuedAt: Date.now(),
      }));
      this.logger.log(`Nonce issued for user ${userId}, action: ${action}`);
      return nonce;
    } catch (error) {
      this.logger.error('Failed to issue nonce:', error);
      // Return nonce anyway - don't block operations if Redis is down
      return nonce;
    }
  }

  /**
   * Validate and consume a nonce. Returns true if valid, throws if invalid.
   * Once validated, the nonce is immediately deleted (single-use).
   */
  async validate(nonce: string, userId: string, action: string): Promise<boolean> {
    if (!nonce) {
      throw new BadRequestException('Nonce is required for this operation');
    }

    const key = this.redisKey(nonce);

    try {
      const stored = await this.redis.get(key);

      if (!stored) {
        this.logger.warn(`Nonce rejected (expired/invalid): ${nonce.substring(0, 12)}... user: ${userId}`);
        throw new BadRequestException('Invalid or expired nonce. Please request a new one.');
      }

      const data = JSON.parse(stored);

      // Verify the nonce belongs to this user and action
      if (data.userId !== userId) {
        this.logger.warn(`Nonce user mismatch: expected ${data.userId}, got ${userId}`);
        throw new BadRequestException('Invalid nonce');
      }

      if (data.action !== action) {
        this.logger.warn(`Nonce action mismatch: expected ${data.action}, got ${action}`);
        throw new BadRequestException('Invalid nonce for this action');
      }

      // Consume the nonce (delete it so it can't be reused)
      await this.redis.del(key);
      this.logger.log(`Nonce consumed for user ${userId}, action: ${action}`);

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Nonce validation error:', error);
      // On Redis failure, allow the operation (fail-open for availability)
      return true;
    }
  }

  /**
   * Revoke all nonces for a specific user (e.g. on logout or suspicious activity)
   */
  async revokeAll(userId: string): Promise<number> {
    try {
      const keys = await this.redis.keys('nonce:*');
      let revoked = 0;

      for (const key of keys) {
        const stored = await this.redis.get(key);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.userId === userId) {
            await this.redis.del(key);
            revoked++;
          }
        }
      }

      this.logger.log(`Revoked ${revoked} nonces for user ${userId}`);
      return revoked;
    } catch (error) {
      this.logger.error('Failed to revoke nonces:', error);
      return 0;
    }
  }

  private redisKey(nonce: string): string {
    return `nonce:${nonce}`;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
