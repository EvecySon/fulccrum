import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider';

@Injectable()
export class StorageFactory {
  constructor(
    private config: ConfigService,
    private localProvider: LocalStorageProvider,
    private cloudinaryProvider: CloudinaryStorageProvider,
  ) {}

  getProvider(): StorageProvider {
    const provider = this.config.get('STORAGE_PROVIDER') || 'local';

    switch (provider) {
      case 'cloudinary':
        return this.cloudinaryProvider;
      case 's3':
        // TODO: Implement S3 provider when needed
        throw new Error('S3 provider not yet implemented. Use "local" or "cloudinary".');
      case 'local':
      default:
        return this.localProvider;
    }
  }
}
