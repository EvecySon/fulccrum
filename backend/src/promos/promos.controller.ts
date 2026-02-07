import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PromosService } from './promos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';

@Controller('promos')
@UseGuards(JwtAuthGuard)
export class PromosController {
  constructor(private promosService: PromosService) {}

  @Post()
  async createPromo(@Body() dto: CreatePromoDto) {
    return this.promosService.createPromo(dto);
  }

  @Post('validate')
  async validatePromo(@Request() req: any, @Body() dto: ValidatePromoDto) {
    return this.promosService.validatePromo(req.user.sub, dto);
  }

  @Get()
  async getPromos(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.promosService.getPromos(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      activeOnly !== 'false',
    );
  }

  @Get('my-usage')
  async getMyPromoUsage(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.promosService.getUserPromoUsage(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  async getPromo(@Param('id') id: string) {
    return this.promosService.getPromo(id);
  }

  @Get(':id/stats')
  async getPromoStats(@Param('id') id: string) {
    return this.promosService.getPromoStats(id);
  }

  @Put(':id')
  async updatePromo(@Param('id') id: string, @Body() dto: Partial<CreatePromoDto>) {
    return this.promosService.updatePromo(id, dto);
  }

  @Patch(':id/toggle')
  async togglePromoStatus(@Param('id') id: string) {
    return this.promosService.togglePromoStatus(id);
  }

  @Delete(':id')
  async deletePromo(@Param('id') id: string) {
    return this.promosService.deletePromo(id);
  }
}
