import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
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
      this.logger.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      this.logger.log('Cache Redis connected successfully');
    });
  }

  /**
   * Get cached value
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(`cache:${key}`);
      if (cached) {
        this.logger.debug(`Cache hit: ${key}`);
        return JSON.parse(cached);
      }
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache value with TTL
   */
  async set<T = any>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.defaultTTL;
      await this.redis.setex(
        `cache:${key}`,
        ttl,
        JSON.stringify(value),
      );
      this.logger.debug(`Cached: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(`cache:${key}`);
      this.logger.debug(`Deleted cache: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(`cache:${pattern}`);
      if (keys.length === 0) {
        return 0;
      }
      
      const deleted = await this.redis.del(...keys);
      this.logger.debug(`Deleted ${deleted} cache keys matching: ${pattern}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Execute function with caching
   */
  async wrap<T = any>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    // Check cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttlSeconds);

    return result;
  }

  /**
   * Invalidate cache for a business (menus, items, etc.)
   */
  async invalidateBusinessCache(businessId: string): Promise<void> {
    await Promise.all([
      this.deletePattern(`menu:business:${businessId}:*`),
      this.deletePattern(`restaurant:${businessId}`),
      this.deletePattern(`business:${businessId}:*`),
    ]);
    this.logger.log(`Invalidated cache for business: ${businessId}`);
  }

  /**
   * Invalidate cache for a menu item
   */
  async invalidateMenuItemCache(itemId: string, businessId: string): Promise<void> {
    await Promise.all([
      this.delete(`menuitem:${itemId}`),
      this.deletePattern(`menu:business:${businessId}:*`),
    ]);
    this.logger.log(`Invalidated cache for menu item: ${itemId}`);
  }

  /**
   * Check if Redis is healthy
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
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    healthy: boolean;
    memoryUsage: string;
  }> {
    try {
      const keys = await this.redis.keys('cache:*');
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown';
      
      return {
        totalKeys: keys.length,
        healthy: await this.isHealthy(),
        memoryUsage,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        healthy: false,
        memoryUsage: 'unknown',
      };
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await this.redis.keys('cache:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      this.logger.log(`Cleared all cache (${keys.length} keys)`);
    } catch (error) {
      this.logger.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
