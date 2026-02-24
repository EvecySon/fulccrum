import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageFactory } from './storage.factory';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    StorageFactory,
    LocalStorageProvider,
    CloudinaryStorageProvider,
  ],
  exports: [UploadService],
})
export class UploadModule {}
