import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OperationsService } from '../services/operations.service';
import { AuditService } from '../services/audit.service';

@Controller('admin/operations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class OperationsController {
  constructor(
    private operationsService: OperationsService,
    private auditService: AuditService,
  ) {}

  @Get('live-map')
  async getLiveOperationsData() {
    return this.operationsService.getLiveOperationsData();
  }

  @Get('incidents')
  async getIncidents(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.operationsService.getIncidents({
      status,
      severity,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Post('incidents')
  async createIncident(@Request() req: any, @Body() data: any) {
    const incident = await this.operationsService.createIncident(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_incident',
      resource: 'incident',
      resourceId: incident.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return incident;
  }

  @Patch('incidents/:id/resolve')
  async resolveIncident(@Request() req: any, @Param('id') id: string, @Body('resolution') resolution: string) {
    const incident = await this.operationsService.resolveIncident(id, resolution);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'resolved_incident',
      resource: 'incident',
      resourceId: id,
      changes: { resolution },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return incident;
  }

  @Patch('incidents/:id/assign')
  async assignIncident(@Request() req: any, @Param('id') id: string, @Body('assignedTo') assignedTo: string) {
    return this.operationsService.assignIncident(id, assignedTo);
  }

  @Get('sla/configs')
  async getSLAConfigs() {
    return this.operationsService.getSLAConfigs();
  }

  @Post('sla/configs')
  async createSLAConfig(@Request() req: any, @Body() data: any) {
    const config = await this.operationsService.createSLAConfig(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_sla_config',
      resource: 'sla_config',
      resourceId: config.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return config;
  }

  @Get('sla/breaches')
  async getSLABreaches(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.operationsService.getSLABreaches(new Date(startDate), new Date(endDate));
  }

  @Post('sla/check/:orderId')
  async checkSLABreach(@Param('orderId') orderId: string) {
    return this.operationsService.checkSLABreach(orderId);
  }

  @Get('delivery-zones')
  async getDeliveryZones(@Query('city') city?: string) {
    return this.operationsService.getDeliveryZones(city);
  }

  @Post('delivery-zones')
  async createDeliveryZone(@Request() req: any, @Body() data: any) {
    const zone = await this.operationsService.createDeliveryZone(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_delivery_zone',
      resource: 'delivery_zone',
      resourceId: zone.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return zone;
  }

  @Patch('delivery-zones/:id')
  async updateDeliveryZone(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const zone = await this.operationsService.updateDeliveryZone(id, data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_delivery_zone',
      resource: 'delivery_zone',
      resourceId: id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return zone;
  }
}
