import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '../storage-provider.interface';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor(private config: ConfigService) {
    this.uploadDir = this.config.get('UPLOAD_DIR') || path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'medium'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'originals'), { recursive: true });
    }
  }

  async uploadImage(
    buffer: Buffer,
    filename: string,
    options?: {
      folder?: string;
      generateThumbnail?: boolean;
      generateMedium?: boolean;
    },
  ): Promise<{
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
  }> {
    const folder = options?.folder || 'originals';
    const generateThumbnail = options?.generateThumbnail ?? true;
    const generateMedium = options?.generateMedium ?? true;

    // Save original
    const originalPath = path.join(this.uploadDir, folder, filename);
    await fs.mkdir(path.join(this.uploadDir, folder), { recursive: true });
    await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(originalPath);

    const result: any = {
      url: `/uploads/${folder}/${filename}`,
    };

    // Generate thumbnail
    if (generateThumbnail) {
      const thumbnailPath = path.join(this.uploadDir, 'thumbnails', filename);
      await sharp(buffer)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      result.thumbnailUrl = `/uploads/thumbnails/${filename}`;
    }

    // Generate medium size
    if (generateMedium) {
      const mediumPath = path.join(this.uploadDir, 'medium', filename);
      await sharp(buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(mediumPath);
      result.mediumUrl = `/uploads/medium/${filename}`;
    }

    return result;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'originals',
  ): Promise<{ url: string }> {
    const filePath = path.join(this.uploadDir, folder, filename);
    await fs.mkdir(path.join(this.uploadDir, folder), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return {
      url: `/uploads/${folder}/${filename}`,
    };
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Extract path from URL
      const relativePath = url.replace('/uploads/', '');
      const filePath = path.join(this.uploadDir, relativePath);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  }
}
