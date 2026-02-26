import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import type { CreateTemplateDto, UpdateTemplateDto } from './notification-template.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/notification-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class NotificationTemplateController {
  constructor(private templateService: NotificationTemplateService) {}

  @Post()
  async createTemplate(@Body() dto: CreateTemplateDto, @CurrentUser() user: any) {
    return this.templateService.createTemplate(dto, user.id);
  }

  @Get()
  async getAllTemplates(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.templateService.getAllTemplates({
      type: type as any,
      category,
      isActive: isActive === 'true',
    });
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templateService.getTemplateByKey(id);
  }

  @Get(':id/analytics')
  async getTemplateAnalytics(@Param('id') id: string) {
    return this.templateService.getTemplateAnalytics(id);
  }

  @Put(':id')
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templateService.updateTemplate(id, dto);
  }

  @Put(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return this.templateService.toggleActive(id);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.deleteTemplate(id);
  }
}
