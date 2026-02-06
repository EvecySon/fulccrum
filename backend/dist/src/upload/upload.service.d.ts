import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class UploadService {
    private prisma;
    private config;
    private uploadDir;
    private maxFileSize;
    private allowedImageTypes;
    private allowedDocumentTypes;
    constructor(prisma: PrismaService, config: ConfigService);
    private ensureUploadDirExists;
    uploadImage(file: Express.Multer.File, userId: string, category?: string): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    private createThumbnail;
    private createMediumSize;
    private saveOriginal;
    uploadDocument(file: Express.Multer.File, userId: string, category?: string): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    getUserFiles(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            url: string;
            thumbnailUrl: string | null;
            mediumUrl: string | null;
            uploadedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getFile(fileId: string, userId: string): Promise<{
        id: string;
        userId: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        uploadedAt: Date;
    }>;
    deleteFile(fileId: string, userId: string): Promise<{
        success: boolean;
    }>;
    updateUserAvatar(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    updateBusinessLogo(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    updateBusinessCover(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    getUploadStats(userId: string): Promise<{
        totalFiles: number;
        totalSize: number;
        totalSizeMB: string;
        byType: Record<string, number>;
    }>;
}
