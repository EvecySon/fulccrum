import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PackageDeliveryService } from './package-delivery.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { RequestDeliveryDto } from './dto/request-delivery.dto';
import { RateDeliveryDto } from './dto/rate-delivery.dto';

@Controller('package-delivery')
@UseGuards(JwtAuthGuard)
export class PackageDeliveryController {
  constructor(
    private readonly packageDeliveryService: PackageDeliveryService,
  ) {}

  @Post('calculate-price')
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    const pricing = await this.packageDeliveryService.calculatePrice(
      dto.pickup,
      dto.dropoff,
      dto.size,
      dto.speed,
    );
    
    return {
      success: true,
      data: pricing,
    };
  }

  @Post('request')
  async requestDelivery(
    @Request() req: any,
    @Body() dto: RequestDeliveryDto,
  ) {
    const delivery = await this.packageDeliveryService.requestDelivery(
      req.user.sub,
      dto,
    );
    
    return {
      success: true,
      message: 'Delivery request created. Finding nearby couriers...',
      data: delivery,
    };
  }

  @Get(':id/status')
  async getDeliveryStatus(@Param('id') id: string) {
    const status = await this.packageDeliveryService.getDeliveryStatus(id);
    
    return {
      success: true,
      data: status,
    };
  }

  @Post('requests/:requestId/accept')
  async acceptDelivery(
    @Param('requestId') requestId: string,
    @Request() req: any,
  ) {
    const result = await this.packageDeliveryService.acceptDelivery(
      requestId,
      req.user.sub,
    );
    return {
      success: result.success,
      message: result.message || 'Delivery accepted',
    };
  }

  @Post(':id/cancel')
  async cancelDelivery(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.packageDeliveryService.cancelDelivery(id, req.user.sub);
    
    return {
      success: true,
      message: 'Delivery cancelled successfully',
    };
  }

  @Post(':id/rate')
  async rateDelivery(
    @Param('id') id: string,
    @Body() dto: RateDeliveryDto,
  ) {
    await this.packageDeliveryService.rateDelivery(
      id,
      dto.rating,
      dto.feedback,
    );
    
    return {
      success: true,
      message: 'Thank you for your feedback!',
    };
  }

  @Get('history')
  async getHistory(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const history = await this.packageDeliveryService.getHistory(
      req.user.sub,
      parseInt(page),
      parseInt(limit),
    );
    
    return {
      success: true,
      data: history,
    };
  }
}
