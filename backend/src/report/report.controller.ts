import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post('content')
  async reportContent(
    @Request() req: any,
    @Body() data: { type: string; resourceId: string; reason: string; details?: string },
  ) {
    return this.reportService.reportContent(req.user.sub, data);
  }

  @Get('my-reports')
  async getMyReports(@Request() req: any) {
    return this.reportService.getMyReports(req.user.sub);
  }
}
