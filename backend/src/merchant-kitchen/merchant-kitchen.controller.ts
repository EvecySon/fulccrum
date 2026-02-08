import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MerchantKitchenService } from './merchant-kitchen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/kitchen')
@UseGuards(JwtAuthGuard)
export class MerchantKitchenController {
  constructor(private readonly kitchenService: MerchantKitchenService) {}

  @Get('operations')
  async getOperations(@Request() req: any) {
    return this.kitchenService.getOperations(req.user.sub);
  }

  @Post('operations')
  async createOperation(@Request() req: any, @Body() body: { orderId: string; itemId: string; operationType: string }) {
    return this.kitchenService.createOperation(req.user.sub, body);
  }

  @Patch('operations/:id')
  async updateOperation(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.kitchenService.updateOperation(req.user.sub, id, data);
  }

  @Get('inventory')
  async getInventory(@Request() req: any) {
    return this.kitchenService.getInventory(req.user.sub);
  }

  @Patch('inventory/:id')
  async updateInventory(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.kitchenService.updateInventory(req.user.sub, id, data);
  }

  @Get('prep-predictions')
  async getPrepPredictions(@Request() req: any) {
    return this.kitchenService.getPrepPredictions(req.user.sub);
  }
}
