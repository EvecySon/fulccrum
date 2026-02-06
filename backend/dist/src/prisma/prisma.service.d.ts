import { INestApplication, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private config;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    enableShutdownHooks(app: INestApplication): Promise<void>;
}
