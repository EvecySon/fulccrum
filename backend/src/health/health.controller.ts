import { Controller, Get } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { CacheService } from '../common/services/cache.service';
import { IdempotencyService } from '../common/services/idempotency.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly queueService: QueueService,
    private readonly cacheService: CacheService,
    private readonly idempotencyService: IdempotencyService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('cache')
  async getCacheHealth() {
    const stats = await this.cacheService.getStats();
    return {
      service: 'cache',
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('idempotency')
  async getIdempotencyHealth() {
    const stats = await this.idempotencyService.getStats();
    return {
      service: 'idempotency',
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queue')
  async getQueueHealth() {
    const [emailStats, notificationStats] = await Promise.all([
      this.queueService.getEmailQueueStats(),
      this.queueService.getNotificationQueueStats(),
    ]);

    return {
      service: 'queue',
      queues: [emailStats, notificationStats],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('database')
  async getDatabaseHealth() {
    try {
      // Simple query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        service: 'database',
        healthy: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'database',
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('all')
  async getAllHealth() {
    const [cache, idempotency, queue, database] = await Promise.all([
      this.getCacheHealth(),
      this.getIdempotencyHealth(),
      this.getQueueHealth(),
      this.getDatabaseHealth(),
    ]);

    const allHealthy = 
      cache.healthy && 
      idempotency.healthy && 
      database.healthy;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services: {
        cache,
        idempotency,
        queue,
        database,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
