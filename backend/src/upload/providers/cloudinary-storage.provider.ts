import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '../storage-provider.interface';
import sharp from 'sharp';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);
  private cloudinary: any;

  constructor(private config: ConfigService) {
    // Lazy load cloudinary only when needed
    if (this.config.get('CLOUDINARY_CLOUD_NAME')) {
      this.initializeCloudinary();
    }
  }

  private initializeCloudinary() {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.config.get('CLOUDINARY_API_KEY'),
        api_secret: this.config.get('CLOUDINARY_API_SECRET'),
      });
      this.cloudinary = cloudinary;
      this.logger.log('Cloudinary initialized successfully');
    } catch (error) {
      this.logger.warn('Cloudinary package not installed. Run: npm install cloudinary');
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
    if (!this.cloudinary) {
      throw new Error('Cloudinary not configured. Set CLOUDINARY_* environment variables.');
    }

    const folder = options?.folder || 'uploads';

    // Upload original to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          resource_type: 'image',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    // Cloudinary can generate thumbnails on-the-fly via URL transformations
    const baseUrl = uploadResult.secure_url;
    
    return {
      url: baseUrl,
      thumbnailUrl: baseUrl.replace('/upload/', '/upload/w_150,h_150,c_fill/'),
      mediumUrl: baseUrl.replace('/upload/', '/upload/w_800,h_800,c_limit/'),
    };
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'uploads',
  ): Promise<{ url: string }> {
    if (!this.cloudinary) {
      throw new Error('Cloudinary not configured. Set CLOUDINARY_* environment variables.');
    }

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/\.[^/.]+$/, ''),
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    return {
      url: uploadResult.secure_url,
    };
  }

  async deleteFile(url: string): Promise<void> {
    if (!this.cloudinary) {
      return;
    }

    try {
      // Extract public_id from Cloudinary URL
      const matches = url.match(/\/([^/]+)\.[^.]+$/);
      if (matches) {
        const publicId = matches[1];
        await this.cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      this.logger.error('Error deleting file from Cloudinary:', error);
    }
  }
}
