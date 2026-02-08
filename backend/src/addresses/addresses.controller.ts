import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import type { CreateAddressDto, UpdateAddressDto } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getUserAddresses(@Request() req: any) {
    return this.addressesService.getUserAddresses(req.user.sub);
  }

  @Get(':id')
  async getAddress(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.getAddress(req.user.sub, id);
  }

  @Post()
  async createAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
    return this.addressesService.createAddress(req.user.sub, dto);
  }

  @Patch(':id')
  async updateAddress(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.updateAddress(req.user.sub, id, dto);
  }

  @Delete(':id')
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.deleteAddress(req.user.sub, id);
  }

  @Patch(':id/set-default')
  async setDefaultAddress(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.setDefaultAddress(req.user.sub, id);
  }
}
