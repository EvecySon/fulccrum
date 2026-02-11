import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async getMyListings(@Request() req: any) {
    return this.marketplaceService.getListings(req.user.sub);
  }

  @Get('browse')
  async browseAll(@Query('page') page = 1) {
    return this.marketplaceService.getAllActiveListings(+page);
  }

  @Post()
  async createListing(@Request() req: any, @Body() body: any) {
    return this.marketplaceService.createListing(req.user.sub, body);
  }

  @Patch(':id')
  async updateListing(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.marketplaceService.updateListing(req.user.sub, id, body);
  }

  @Patch(':id/toggle')
  async toggleListing(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.toggleListing(req.user.sub, id);
  }

  @Delete(':id')
  async deleteListing(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.deleteListing(req.user.sub, id);
  }
}
