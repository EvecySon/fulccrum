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
      dto.additionalStops,
      dto.insuranceTier,
    );
    
    return {
      success: true,
      data: pricing,
    };
  }

  @Post('validate-promo')
  async validatePromo(@Body() body: { code: string }) {
    const result = await this.packageDeliveryService.validatePromo(body.code);
    return { success: true, data: result };
  }

  @Get(':id/proofs')
  async getDeliveryProofs(@Param('id') id: string) {
    const proofs = await this.packageDeliveryService.getDeliveryProofs(id);
    return { success: true, data: proofs };
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

  @Get('active')
  async getActiveOrders(@Request() req: any) {
    const orders = await this.packageDeliveryService.getActiveOrders(req.user.sub);
    return { success: true, data: orders };
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

  @Post(':id/mark-picked-up')
  async markPickedUp(@Param('id') id: string, @Request() req: any) {
    return this.packageDeliveryService.markPickedUp(id, req.user.sub);
  }

  @Post(':id/mark-delivered')
  async markDelivered(@Param('id') id: string, @Request() req: any) {
    return this.packageDeliveryService.markDelivered(id, req.user.sub);
  }

  @Post(':id/cancel')
  async cancelDelivery(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { reason?: string },
  ) {
    const result = await this.packageDeliveryService.cancelDelivery(id, req.user.sub, body?.reason);
    
    return {
      success: true,
      message: 'Delivery cancelled successfully',
      data: { cancellationFee: result.cancellationFee },
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
