import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/flash-sales')
@UseGuards(JwtAuthGuard)
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Get()
  async getAll(@Request() req: any) {
    return this.flashSalesService.getAll(req.user.sub);
  }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    return this.flashSalesService.create(req.user.sub, data);
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.flashSalesService.update(req.user.sub, id, data);
  }

  @Patch(':id/toggle')
  async toggle(@Request() req: any, @Param('id') id: string) {
    return this.flashSalesService.toggle(req.user.sub, id);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.flashSalesService.delete(req.user.sub, id);
  }
}
