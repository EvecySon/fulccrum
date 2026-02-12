import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModerationService } from '../services/moderation.service';
import { ComplianceService } from '../services/compliance.service';
import { AuditService } from '../services/audit.service';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ModerationController {
  constructor(
    private moderationService: ModerationService,
    private complianceService: ComplianceService,
    private auditService: AuditService,
  ) {}

  @Get('queue')
  async getQueue(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.getQueue({
      type,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Patch(':id/approve')
  async approve(@Request() req: any, @Param('id') id: string) {
    const result = await this.moderationService.approve(id, req.user.sub);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'approved_content',
      resource: 'content_moderation',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Patch(':id/reject')
  async reject(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    const result = await this.moderationService.reject(id, req.user.sub, reason);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'rejected_content',
      resource: 'content_moderation',
      resourceId: id,
      changes: { reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Get('stats')
  async getStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.moderationService.getModerationStats(new Date(startDate), new Date(endDate));
  }

  @Get('compliance')
  async getAllCompliance(
    @Query('status') status?: string,
    @Query('expiringSoon') expiringSoon?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.complianceService.getAllCompliance({
      status,
      expiringSoon: expiringSoon === 'true',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('compliance/:businessId')
  async getCompliance(@Param('businessId') businessId: string) {
    return this.complianceService.getCompliance(businessId);
  }

  @Patch('compliance/:businessId')
  async updateCompliance(@Request() req: any, @Param('businessId') businessId: string, @Body() data: any) {
    const result = await this.complianceService.createOrUpdateCompliance({ businessId, ...data });
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_compliance',
      resource: 'merchant_compliance',
      resourceId: result.id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Get('compliance/stats')
  async getComplianceStats() {
    return this.complianceService.getComplianceStats();
  }
}
