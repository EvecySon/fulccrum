import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StorageFactory } from './storage.factory';
import { randomBytes } from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class UploadService {
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storageFactory: StorageFactory,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    category: string = 'general',
  ) {
    // Validate file
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Generate unique filename
    const fileExt = mime.extension(file.mimetype) || 'jpg';
    const uniqueName = `${randomBytes(16).toString('hex')}.${fileExt}`;

    // Use storage provider to upload
    const storage = this.storageFactory.getProvider();
    const uploadResult = await storage.uploadImage(file.buffer, uniqueName, {
      folder: 'originals',
      generateThumbnail: true,
      generateMedium: true,
    });

    // Save to database
    const uploadedFile = await this.prisma.mediaFile.create({
      data: {
        userId,
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        mediumUrl: uploadResult.mediumUrl,
      },
    });

    return {
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      url: uploadedFile.url,
      thumbnailUrl: uploadedFile.thumbnailUrl,
      mediumUrl: uploadedFile.mediumUrl,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimeType,
    };
  }


  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    category: string = 'document',
  ) {
    // Validate file
    if (!this.allowedDocumentTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid document type. Only PDF and Word documents are allowed.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Generate unique filename
    const fileExt = mime.extension(file.mimetype) || 'pdf';
    const uniqueName = `${randomBytes(16).toString('hex')}.${fileExt}`;

    // Use storage provider
    const storage = this.storageFactory.getProvider();
    const uploadResult = await storage.uploadFile(file.buffer, uniqueName, file.mimetype, 'documents');

    // Save to database
    const uploadedFile = await this.prisma.mediaFile.create({
      data: {
        userId,
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.url,
      },
    });

    return {
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      url: uploadedFile.url,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimeType,
    };
  }

  async getUserFiles(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where: { userId },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          thumbnailUrl: true,
          mediumUrl: true,
          uploadedAt: true,
        },
      }),
      this.prisma.mediaFile.count({ where: { userId } }),
    ]);

    return {
      data: files,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFile(fileId: string, userId: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (file.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return file;
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.getFile(fileId, userId);

    // Delete from storage provider
    const storage = this.storageFactory.getProvider();
    await Promise.all([
      storage.deleteFile(file.url),
      file.thumbnailUrl ? storage.deleteFile(file.thumbnailUrl) : Promise.resolve(),
      file.mediumUrl ? storage.deleteFile(file.mediumUrl) : Promise.resolve(),
    ]);

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id: fileId },
    });

    return { success: true };
  }

  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    // Validate file type
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Simple upload without image processing
    const fileExt = mime.extension(file.mimetype) || 'jpg';
    const uniqueName = `avatar-${userId}-${Date.now()}.${fileExt}`;
    
    const storage = this.storageFactory.getProvider();
    const uploadResult = await storage.uploadFile(file.buffer, uniqueName, file.mimetype, 'avatars');

    // Store the relative URL — clients prepend their own base URL
    // For external providers (Cloudinary/S3) the URL is already absolute
    const storedUrl = uploadResult.url;

    // Save to database
    const uploadedFile = await this.prisma.mediaFile.create({
      data: {
        userId,
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: storedUrl,
      },
    });

    // Update user avatar
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: storedUrl },
    });

    return {
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      url: storedUrl,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimeType,
    };
  }

  async updateBusinessLogo(userId: string, file: Express.Multer.File) {
    const uploadedFile = await this.uploadImage(file, userId, 'business_logo');

    // Update business profile logo
    await this.prisma.businessProfile.update({
      where: { userId },
      data: { logoUrl: uploadedFile.url },
    });

    return uploadedFile;
  }

  async updateBusinessCover(userId: string, file: Express.Multer.File) {
    const uploadedFile = await this.uploadImage(file, userId, 'business_cover');

    // Update business profile cover
    await this.prisma.businessProfile.update({
      where: { userId },
      data: { coverImageUrl: uploadedFile.url },
    });

    return uploadedFile;
  }

  // Generic file upload (used by documents & delivery proofs)
  async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const fileExt = mime.extension(file.mimetype) || 'bin';
    const uniqueName = `${randomBytes(16).toString('hex')}.${fileExt}`;

    // Use storage provider
    const storage = this.storageFactory.getProvider();
    const uploadResult = await storage.uploadFile(file.buffer, uniqueName, file.mimetype, folder);

    return {
      url: uploadResult.url,
      filename: uniqueName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  // Helper method to get file statistics
  async getUploadStats(userId: string) {
    const files = await this.prisma.mediaFile.findMany({
      where: { userId },
      select: { size: true, mimeType: true },
    });

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalFiles = files.length;

    const byType = files.reduce((acc, file) => {
      const type = file.mimeType.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      byType,
    };
  }
}
