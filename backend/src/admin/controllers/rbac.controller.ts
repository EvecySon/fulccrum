import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PermissionsService } from '../services/permissions.service';
import { AuditService } from '../services/audit.service';

@Controller('admin/rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RBACController {
  constructor(
    private permissionsService: PermissionsService,
    private auditService: AuditService,
  ) {}

  @Post('roles')
  async createRole(@Request() req: any, @Body() data: any) {
    const role = await this.permissionsService.createRole(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_role',
      resource: 'admin_role',
      resourceId: role.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return role;
  }

  @Get('roles')
  async getRoles() {
    return this.permissionsService.getRoles();
  }

  @Patch('roles/:id')
  async updateRole(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const role = await this.permissionsService.updateRole(id, data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_role',
      resource: 'admin_role',
      resourceId: id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return role;
  }

  @Post('assign')
  async assignRole(@Request() req: any, @Body() data: { userId: string; roleId: string; department?: string }) {
    const assignment = await this.permissionsService.assignRole(data.userId, data.roleId, data.department);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'assigned_role',
      resource: 'admin_user',
      resourceId: assignment.id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return assignment;
  }

  @Get('permissions/:userId')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('adminUserId') adminUserId?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getLogs({
      adminUserId,
      resource,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('audit-logs/resource/:resource/:resourceId')
  async getResourceHistory(@Param('resource') resource: string, @Param('resourceId') resourceId: string) {
    return this.auditService.getResourceHistory(resource, resourceId);
  }

  @Get('audit-logs/export')
  async exportAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('resource') resource?: string,
  ) {
    return this.auditService.exportLogs({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      resource,
    });
  }
}
