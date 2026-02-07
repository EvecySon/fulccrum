import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Patch('business/profile')
  async updateBusinessProfile(@Request() req, @Body() dto: UpdateBusinessProfileDto) {
    return this.usersService.updateBusinessProfile(req.user.sub, dto);
  }
}
