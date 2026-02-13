import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RejectDocumentDto } from './dto/verify-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    userId: string,
    dto: UploadDocumentDto,
    fileUrl: string,
  ) {
    // Check if document of this type already exists for user
    const existing = await this.prisma.document.findFirst({
      where: {
        userId,
        type: dto.type,
      },
    });

    if (existing) {
      // Update existing document
      return this.prisma.document.update({
        where: { id: existing.id },
        data: {
          name: dto.name,
          fileUrl,
          status: 'uploaded',
          rejectionReason: null,
          verifiedBy: null,
          verifiedAt: null,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
    }

    // Create new document
    return this.prisma.document.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        fileUrl,
        status: 'uploaded',
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async getMyDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        name: true,
        fileUrl: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async deleteDocument(userId: string, documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.userId !== userId) {
      throw new BadRequestException('You can only delete your own documents');
    }

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  // Admin methods
  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        verifier: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async verifyDocument(documentId: string, adminId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'verified',
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async rejectDocument(
    documentId: string,
    adminId: string,
    dto: RejectDocumentDto,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'rejected',
        rejectionReason: dto.reason,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
