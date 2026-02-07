import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.sub, dto);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.getOrder(id, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, req.user.sub, req.user.role);
  }

  @Get('customer/my-orders')
  async getMyOrders(
    @Request() req,
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
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.ordersService.getDriverOrders(req.user.sub, status);
  }

  @Get('business/:businessId')
  async getBusinessOrders(
    @Param('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getBusinessOrders(
      businessId,
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
