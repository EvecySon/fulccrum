import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UploadService } from '../upload/upload.service';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private uploadService: UploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload file to storage (S3/Cloudinary)
    const uploadResult = await this.uploadService.uploadFile(file, 'documents');

    // Save document record to database
    const document = await this.documentsService.uploadDocument(
      req.user.sub,
      dto,
      uploadResult.url,
    );

    return {
      id: document.id,
      type: document.type,
      name: document.name,
      fileUrl: document.fileUrl,
      status: document.status,
      createdAt: document.createdAt,
    };
  }

  @Get('my-documents')
  async getMyDocuments(@Request() req: any) {
    return this.documentsService.getMyDocuments(req.user.sub);
  }

  @Delete(':id')
  async deleteDocument(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user.sub, id);
  }

  @Get('user/:userId')
  async getUserDocuments(@Request() req: any, @Param('userId') userId: string) {
    return this.documentsService.getUserDocuments(userId);
  }

  @Post(':id/verify')
  async verifyDocument(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.verifyDocument(id, req.user.sub);
  }

  @Post(':id/reject')
  async rejectDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.documentsService.rejectDocument(id, req.user.sub, dto);
  }

  @Get('pending')
  async getPendingDocuments(@Request() req: any) {
    return this.documentsService.getPendingDocuments();
  }
}
