import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Patch('business/profile')
  async updateBusinessProfile(@Request() req: any, @Body() dto: UpdateBusinessProfileDto) {
    return this.usersService.updateBusinessProfile(req.user.sub, dto);
  }

  @Delete('account')
  async deleteAccount(@Request() req: any, @Body() dto: DeleteAccountDto) {
    console.log('[CONTROLLER] DELETE /users/account called');
    console.log('[CONTROLLER] User ID:', req.user.sub);
    console.log('[CONTROLLER] Password provided:', dto.password ? 'YES' : 'NO');
    return this.usersService.deleteAccount(req.user.sub, dto.password);
  }

  @Post('change-password')
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
  }

  @Get('data-export')
  async exportUserData(@Request() req: any) {
    return this.usersService.exportUserData(req.user.sub);
  }
}
