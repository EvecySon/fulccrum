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
  Request,
} from '@nestjs/common';
import { ZonesService } from './zones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('zones')
@UseGuards(JwtAuthGuard)
export class ZonesController {
  constructor(private zonesService: ZonesService) {}

  @Post()
  async createZone(@Request() req: any, @Body() data: any) {
    return this.zonesService.createZone(req.user.sub, data);
  }

  @Get('business/:businessId')
  async getBusinessZones(@Param('businessId') businessId: string, @Request() req: any) {
    const resolvedId = businessId === 'me' ? req.user.sub : businessId;
    return this.zonesService.getBusinessZones(resolvedId);
  }

  @Get(':id')
  async getZone(@Param('id') id: string) {
    return this.zonesService.getZone(id);
  }

  @Put(':id')
  async updateZone(@Param('id') id: string, @Body() data: any) {
    return this.zonesService.updateZone(id, data);
  }

  @Delete(':id')
  async deleteZone(@Param('id') id: string) {
    return this.zonesService.deleteZone(id);
  }

  @Post('check-availability')
  async checkAvailability(@Body() data: any) {
    return this.zonesService.checkDeliveryAvailability(
      data.businessId,
      data.latitude,
      data.longitude,
    );
  }

  @Get(':id/active-orders')
  async getActiveOrders(@Param('id') id: string) {
    return this.zonesService.getActiveOrdersInZone(id);
  }
}
