import { UploadService } from './upload.service';
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File, req: any): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    uploadDocument(file: Express.Multer.File, req: any): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    uploadAvatar(file: Express.Multer.File, req: any): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    uploadBusinessLogo(file: Express.Multer.File, req: any): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    uploadBusinessCover(file: Express.Multer.File, req: any): Promise<{
        id: string;
        filename: string;
        originalName: string;
        url: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        size: number;
        mimeType: string;
    }>;
    getUserFiles(req: any, page?: string, limit?: string): Promise<{
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
    getFile(id: string, req: any): Promise<{
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
    deleteFile(id: string, req: any): Promise<{
        success: boolean;
    }>;
    getUploadStats(req: any): Promise<{
        totalFiles: number;
        totalSize: number;
        totalSizeMB: string;
        byType: Record<string, number>;
    }>;
}
