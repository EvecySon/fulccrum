import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { MerchantCrmService } from './merchant-crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/crm')
@UseGuards(JwtAuthGuard)
export class MerchantCrmController {
  constructor(private readonly crmService: MerchantCrmService) {}

  @Get('customers')
  async getCustomerProfiles(@Request() req: any, @Query('page') page = 1) {
    return this.crmService.getCustomerProfiles(req.user.sub, +page);
  }

  @Get('customers/:customerId')
  async getCustomerProfile(@Request() req: any, @Param('customerId') customerId: string) {
    return this.crmService.getCustomerProfile(req.user.sub, customerId);
  }

  @Post('customers')
  async createCustomerNote(@Request() req: any, @Body() data: any) {
    return this.crmService.createCustomerNote(req.user.sub, data);
  }

  @Get('campaigns')
  async getCampaigns(@Request() req: any) {
    return this.crmService.getCampaigns(req.user.sub);
  }

  @Post('campaigns')
  async createCampaign(@Request() req: any, @Body() data: any) {
    return this.crmService.createCampaign(req.user.sub, data);
  }

  @Patch('campaigns/:id')
  async updateCampaign(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.crmService.updateCampaign(req.user.sub, id, data);
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Request() req: any, @Param('id') id: string) {
    return this.crmService.deleteCampaign(req.user.sub, id);
  }

  @Get('loyalty')
  async getLoyaltyProgram(@Request() req: any) {
    return this.crmService.getLoyaltyProgram(req.user.sub);
  }

  @Patch('loyalty')
  async updateLoyaltyProgram(@Request() req: any, @Body() data: any) {
    return this.crmService.updateLoyaltyProgram(req.user.sub, data);
  }
}
