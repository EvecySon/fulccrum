import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.sub, dto);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.getOrder(id, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, req.user.sub, req.user.role);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(id, req.user.sub, dto.reason);
  }

  @Post(':id/reorder')
  async reorder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.reorder(id, req.user.sub);
  }

  @Post(':id/tip')
  async addTip(
    @Request() req: any,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.ordersService.addTip(id, req.user.sub, amount);
  }

  @Get(':id/receipt')
  async getReceipt(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getReceipt(id, req.user.sub);
  }

  @Get('customer/my-orders')
  async getMyOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getCustomerOrders(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('driver/assigned')
  async getDriverOrders(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    return this.ordersService.getDriverOrders(req.user.sub, status);
  }

  @Get('business/:businessId')
  async getBusinessOrders(
    @Param('businessId') businessId: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const resolvedId = businessId === 'me' ? req.user.sub : businessId;
    return this.ordersService.getBusinessOrders(
      resolvedId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch(':id/assign-driver')
  async assignDriver(
    @Param('id') id: string,
    @Body('driverId') driverId: string,
  ) {
    return this.ordersService.assignDriver(id, driverId);
  }

  @Get('available/deliveries')
  async getAvailableDeliveries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getAvailableDeliveries(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
