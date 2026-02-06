"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const crypto_1 = require("crypto");
const mime = __importStar(require("mime-types"));
let UploadService = class UploadService {
    prisma;
    config;
    uploadDir;
    maxFileSize = 10 * 1024 * 1024;
    allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.uploadDir = this.config.get('UPLOAD_DIR') || path.join(process.cwd(), 'uploads');
        this.ensureUploadDirExists();
    }
    async ensureUploadDirExists() {
        try {
            await fs.access(this.uploadDir);
        }
        catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'medium'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'originals'), { recursive: true });
        }
    }
    async uploadImage(file, userId, category = 'general') {
        if (!this.allowedImageTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only images are allowed.');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size exceeds 10MB limit');
        }
        const fileExt = mime.extension(file.mimetype) || 'jpg';
        const uniqueName = `${(0, crypto_1.randomBytes)(16).toString('hex')}.${fileExt}`;
        const [thumbnail, medium, original] = await Promise.all([
            this.createThumbnail(file.buffer, uniqueName),
            this.createMediumSize(file.buffer, uniqueName),
            this.saveOriginal(file.buffer, uniqueName),
        ]);
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
    async createThumbnail(buffer, filename) {
        const thumbnailPath = path.join(this.uploadDir, 'thumbnails', filename);
        await (0, sharp_1.default)(buffer)
            .resize(150, 150, {
            fit: 'cover',
            position: 'center',
        })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        return thumbnailPath;
    }
    async createMediumSize(buffer, filename) {
        const mediumPath = path.join(this.uploadDir, 'medium', filename);
        await (0, sharp_1.default)(buffer)
            .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .jpeg({ quality: 85 })
            .toFile(mediumPath);
        return mediumPath;
    }
    async saveOriginal(buffer, filename) {
        const originalPath = path.join(this.uploadDir, 'originals', filename);
        await (0, sharp_1.default)(buffer)
            .jpeg({ quality: 90 })
            .toFile(originalPath);
        return originalPath;
    }
    async uploadDocument(file, userId, category = 'document') {
        if (!this.allowedDocumentTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid document type. Only PDF and Word documents are allowed.');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size exceeds 10MB limit');
        }
        const fileExt = mime.extension(file.mimetype) || 'pdf';
        const uniqueName = `${(0, crypto_1.randomBytes)(16).toString('hex')}.${fileExt}`;
        const filePath = path.join(this.uploadDir, 'originals', uniqueName);
        await fs.writeFile(filePath, file.buffer);
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
    async getUserFiles(userId, page = 1, limit = 20) {
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
    async getFile(fileId, userId) {
        const file = await this.prisma.mediaFile.findUnique({
            where: { id: fileId },
        });
        if (!file) {
            throw new common_1.BadRequestException('File not found');
        }
        if (file.userId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        return file;
    }
    async deleteFile(fileId, userId) {
        const file = await this.getFile(fileId, userId);
        const filesToDelete = [
            path.join(this.uploadDir, 'originals', file.filename),
        ];
        if (file.thumbnailUrl) {
            filesToDelete.push(path.join(this.uploadDir, 'thumbnails', file.filename));
        }
        if (file.mediumUrl) {
            filesToDelete.push(path.join(this.uploadDir, 'medium', file.filename));
        }
        await Promise.all(filesToDelete.map(filePath => fs.unlink(filePath).catch(() => {
        })));
        await this.prisma.mediaFile.delete({
            where: { id: fileId },
        });
        return { success: true };
    }
    async updateUserAvatar(userId, file) {
        const uploadedFile = await this.uploadImage(file, userId, 'profile');
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: uploadedFile.url },
        });
        return uploadedFile;
    }
    async updateBusinessLogo(userId, file) {
        const uploadedFile = await this.uploadImage(file, userId, 'business_logo');
        await this.prisma.businessProfile.update({
            where: { userId },
            data: { logoUrl: uploadedFile.url },
        });
        return uploadedFile;
    }
    async updateBusinessCover(userId, file) {
        const uploadedFile = await this.uploadImage(file, userId, 'business_cover');
        await this.prisma.businessProfile.update({
            where: { userId },
            data: { coverImageUrl: uploadedFile.url },
        });
        return uploadedFile;
    }
    async getUploadStats(userId) {
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
        }, {});
        return {
            totalFiles,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            byType,
        };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map