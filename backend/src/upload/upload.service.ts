import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomBytes } from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class UploadService {
  private uploadDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
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

    // Process and save images in different sizes
    const [thumbnail, medium, original] = await Promise.all([
      this.createThumbnail(file.buffer, uniqueName),
      this.createMediumSize(file.buffer, uniqueName),
      this.saveOriginal(file.buffer, uniqueName),
    ]);

    // Save to database
    const uploadedFile = await this.prisma.mediaFile.create({
      data: {
        userId,
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/originals/${uniqueName}`,
        thumbnailUrl: `/uploads/thumbnails/${uniqueName}`,
        mediumUrl: `/uploads/medium/${uniqueName}`,
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

  private async createThumbnail(buffer: Buffer, filename: string): Promise<string> {
    const thumbnailPath = path.join(this.uploadDir, 'thumbnails', filename);
    
    await sharp(buffer)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  private async createMediumSize(buffer: Buffer, filename: string): Promise<string> {
    const mediumPath = path.join(this.uploadDir, 'medium', filename);
    
    await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    return mediumPath;
  }

  private async saveOriginal(buffer: Buffer, filename: string): Promise<string> {
    const originalPath = path.join(this.uploadDir, 'originals', filename);
    
    // Optimize original but keep full size
    await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(originalPath);

    return originalPath;
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
    const filePath = path.join(this.uploadDir, 'originals', uniqueName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Save to database
    const uploadedFile = await this.prisma.mediaFile.create({
      data: {
        userId,
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/originals/${uniqueName}`,
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

    // Delete physical files
    const filesToDelete = [
      path.join(this.uploadDir, 'originals', file.filename),
    ];

    if (file.thumbnailUrl) {
      filesToDelete.push(path.join(this.uploadDir, 'thumbnails', file.filename));
    }

    if (file.mediumUrl) {
      filesToDelete.push(path.join(this.uploadDir, 'medium', file.filename));
    }

    await Promise.all(
      filesToDelete.map(filePath =>
        fs.unlink(filePath).catch(() => {
          // Ignore errors if file doesn't exist
        }),
      ),
    );

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id: fileId },
    });

    return { success: true };
  }

  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    const uploadedFile = await this.uploadImage(file, userId, 'profile');

    // Update user avatar
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploadedFile.url },
    });

    return uploadedFile;
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
    const filePath = path.join(this.uploadDir, folder, uniqueName);

    // Ensure folder exists
    await fs.mkdir(path.join(this.uploadDir, folder), { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${folder}/${uniqueName}`,
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
