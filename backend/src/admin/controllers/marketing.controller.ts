import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CampaignService } from '../services/campaign.service';
import { AuditService } from '../services/audit.service';

@Controller('admin/marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MarketingController {
  constructor(
    private campaignService: CampaignService,
    private auditService: AuditService,
  ) {}

  @Post('campaigns')
  async createCampaign(@Request() req: any, @Body() data: any) {
    const campaign = await this.campaignService.createCampaign({
      ...data,
      createdBy: req.user.sub,
    });
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_campaign',
      resource: 'campaign',
      resourceId: campaign.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return campaign;
  }

  @Get('campaigns')
  async getCampaigns(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.campaignService.getCampaigns({
      status,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Patch('campaigns/:id')
  async updateCampaign(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const campaign = await this.campaignService.updateCampaign(id, data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_campaign',
      resource: 'campaign',
      resourceId: id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return campaign;
  }

  @Post('campaigns/:id/launch')
  async launchCampaign(@Request() req: any, @Param('id') id: string) {
    const campaign = await this.campaignService.launchCampaign(id);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'launched_campaign',
      resource: 'campaign',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return campaign;
  }

  @Post('campaigns/:id/pause')
  async pauseCampaign(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.pauseCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  async getCampaignAnalytics(@Param('id') id: string) {
    return this.campaignService.getCampaignAnalytics(id);
  }

  @Post('promo-codes')
  async createPromoCode(@Request() req: any, @Body() data: any) {
    const code = await this.campaignService.createPromoCode({
      ...data,
      createdBy: req.user.sub,
    });
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_promo_code',
      resource: 'promo_code',
      resourceId: code.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return code;
  }

  @Get('promo-codes')
  async getPromoCodes(
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.campaignService.getPromoCodes({
      isActive: isActive === 'true',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Patch('promo-codes/:id')
  async updatePromoCode(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const code = await this.campaignService.updatePromoCode(id, data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_promo_code',
      resource: 'promo_code',
      resourceId: id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return code;
  }

  @Post('promo-codes/validate')
  async validatePromoCode(@Body() data: { code: string; userId: string; orderAmount: number }) {
    return this.campaignService.validatePromoCode(data.code, data.userId, data.orderAmount);
  }
}
