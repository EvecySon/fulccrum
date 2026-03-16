import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadImage(file, req.user.sub);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadDocument(file, req.user.sub);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.uploadService.updateUserAvatar(req.user.sub, file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new BadRequestException(error.message || 'Failed to upload avatar');
    }
  }

  @Post('business/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessLogo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.updateBusinessLogo(req.user.sub, file);
  }

  @Post('business/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessCover(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.updateBusinessCover(req.user.sub, file);
  }

  @Get('files')
  async getUserFiles(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.uploadService.getUserFiles(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('files/:id')
  async getFile(@Param('id') id: string, @Request() req: any) {
    return this.uploadService.getFile(id, req.user.sub);
  }

  @Delete('files/:id')
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    return this.uploadService.deleteFile(id, req.user.sub);
  }

  @Get('stats')
  async getUploadStats(@Request() req: any) {
    return this.uploadService.getUploadStats(req.user.sub);
  }
}
