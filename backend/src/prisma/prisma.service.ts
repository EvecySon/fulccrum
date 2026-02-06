import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private config: ConfigService) {
    const datasourceUrl = config.get<string>('DATABASE_URL');
    if (!datasourceUrl) {
      throw new Error(
        'DATABASE_URL is not set. Make sure backend/.env exists and contains DATABASE_URL.',
      );
    }

    const pool = new Pool({
      connectionString: datasourceUrl,
    });

    super({
      adapter: new PrismaPg(pool),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    void app;
  }
}
