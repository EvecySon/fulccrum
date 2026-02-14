import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderService } from './services/order.service';
import { QuestService } from './services/quest.service';
import { SurgeService } from './services/surge.service';
import { PreferencesService } from './services/preferences.service';
import { SchedulingService } from './services/scheduling.service';
import { MaintenanceService } from './services/maintenance.service';
import { ReferralService } from './services/referral.service';
import { InsuranceService } from './services/insurance.service';
import { TrainingService } from './services/training.service';
import { VerificationService } from './services/verification.service';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierController {
  constructor(
    private orderService: OrderService,
    private questService: QuestService,
    private surgeService: SurgeService,
    private preferencesService: PreferencesService,
    private schedulingService: SchedulingService,
    private maintenanceService: MaintenanceService,
    private referralService: ReferralService,
    private insuranceService: InsuranceService,
    private trainingService: TrainingService,
    private verificationService: VerificationService,
  ) {}

  // Quests & Bonuses
  @Get('quests')
  async getQuests(@Request() req: any) {
    return this.questService.getActiveQuests(req.user.sub);
  }

  @Get('quests/:id')
  async getQuestDetails(@Request() req: any, @Param('id') id: string) {
    return this.questService.getQuestDetails(req.user.sub, id);
  }

  @Post('quests/:id/claim')
  async claimQuest(@Request() req: any, @Param('id') id: string) {
    return this.questService.claimQuestReward(req.user.sub, id);
  }

  @Get('quests/summary')
  async getQuestSummary(@Request() req: any) {
    return this.questService.getQuestSummary(req.user.sub);
  }

  // Surge Zones
  @Get('surge-zones')
  async getSurgeZones(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lng ? parseFloat(lng) : undefined;
    return this.surgeService.getActiveSurgeZones(latitude, longitude);
  }

  @Get('hourly-demand')
  async getHourlyDemand() {
    return this.surgeService.getHourlyDemand();
  }

  @Get('surge-stats')
  async getSurgeStats() {
    return this.surgeService.getSurgeStats();
  }

  // Delivery Preferences
  @Get('preferences')
  async getPreferences(@Request() req: any) {
    return this.preferencesService.getPreferences(req.user.sub);
  }

  @Patch('preferences')
  async updatePreferences(@Request() req: any, @Body() data: any) {
    return this.preferencesService.updatePreferences(req.user.sub, data);
  }


  // Tax & Earnings Export
  @Get('tax/monthly')
  async getMonthlyEarnings(@Request() req: any, @Query('month') month: string) {
    return this.orderService.getEarningsSummary(req.user.sub, 'monthly', month);
  }

  @Get('tax/yearly')
  async getYearlyEarnings(@Request() req: any, @Query('year') year: string) {
    return this.orderService.getEarningsSummary(req.user.sub, 'yearly', year);
  }

  @Post('tax/export')
  async exportTaxReport(@Request() req: any) {
    return { message: 'Tax report will be emailed to you shortly' };
  }

  // Insurance
  @Get('insurance/plan')
  async getCurrentInsurancePlan(@Request() req: any) {
    return {
      id: '1',
      name: 'Standard Protection',
      type: 'standard',
      monthlyPremium: 3500,
      coverage: ['Accident coverage up to ₦500,000', 'Third-party liability'],
      maxCoverage: 500000,
      active: true,
    };
  }

  @Get('insurance/plans')
  async getInsurancePlans() {
    return [
      {
        id: '1',
        name: 'Basic Protection',
        type: 'basic',
        monthlyPremium: 2000,
        coverage: ['Accident coverage up to ₦250,000'],
        maxCoverage: 250000,
        active: true,
      },
      {
        id: '2',
        name: 'Standard Protection',
        type: 'standard',
        monthlyPremium: 3500,
        coverage: ['Accident coverage up to ₦500,000', 'Third-party liability'],
        maxCoverage: 500000,
        active: true,
      },
      {
        id: '3',
        name: 'Premium Protection',
        type: 'premium',
        monthlyPremium: 5000,
        coverage: ['Accident coverage up to ₦1,000,000', 'Third-party liability', 'Medical coverage'],
        maxCoverage: 1000000,
        active: true,
      },
    ];
  }

  // Training
  @Get('training/modules')
  async getTrainingModules(@Request() req: any) {
    return this.trainingService.getTrainingModules(req.user.sub);
  }

  @Post('training/:moduleId/complete-lesson')
  async completeLesson(@Request() req: any, @Param('moduleId') moduleId: string) {
    return this.trainingService.completeLesson(req.user.sub, moduleId);
  }

  @Get('training/progress')
  async getTrainingProgress(@Request() req: any) {
    return this.trainingService.getTrainingProgress(req.user.sub);
  }

  // Scheduling
  @Get('schedule')
  async getSchedule(
    @Request() req: any,
    @Query('week') week: string,
    @Query('zone') zone?: string,
  ) {
    return this.schedulingService.getWeekSchedule(req.user.sub, week, zone || 'default');
  }

  @Post('schedule/book')
  async bookShift(@Request() req: any, @Body() data: any) {
    return this.schedulingService.bookShift(req.user.sub, data.slotId, data.date, data.zone || 'default');
  }

  @Delete('schedule/:bookingId')
  async dropShift(@Request() req: any, @Param('bookingId') bookingId: string) {
    return this.schedulingService.dropShift(req.user.sub, bookingId);
  }

  @Get('schedule/my-shifts')
  async getMyShifts(@Request() req: any) {
    return this.schedulingService.getMyShifts(req.user.sub);
  }

  @Get('schedule/zones')
  async getScheduleZones() {
    return this.schedulingService.getZones();
  }

  @Get('schedule/no-shows')
  async getMyNoShows(@Request() req: any) {
    return this.schedulingService.getNoShowHistory(req.user.sub);
  }

  // Maintenance & Reminders
  @Get('reminders')
  async getReminders(@Request() req: any) {
    return this.maintenanceService.getReminders(req.user.sub);
  }

  @Patch('reminders/:id')
  async updateReminder(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.maintenanceService.updateReminder(req.user.sub, id, data);
  }

  @Post('maintenance-log')
  async addMaintenanceLog(@Request() req: any, @Body() data: any) {
    return this.maintenanceService.addMaintenanceLog(req.user.sub, data);
  }

  @Get('maintenance-log')
  async getMaintenanceLogs(@Request() req: any) {
    return this.maintenanceService.getMaintenanceLogs(req.user.sub);
  }

  // Insurance Claims
  @Patch('insurance/plan')
  async changeInsurancePlan(@Request() req: any, @Body() data: any) {
    return this.insuranceService.changePlan(req.user.sub, data.planId);
  }

  @Post('insurance/claims')
  async fileInsuranceClaim(@Request() req: any, @Body() data: any) {
    return this.insuranceService.fileClaim(req.user.sub, data);
  }

  @Get('insurance/claims')
  async getInsuranceClaims(@Request() req: any) {
    return this.insuranceService.getClaims(req.user.sub);
  }

  // ─── Order Accept / Decline / Proof / Rate ───
  @Post('orders/:id/accept')
  async acceptOrder(@Request() req: any, @Param('id') id: string) {
    return this.orderService.acceptOrder(req.user.sub, id);
  }

  @Post('orders/:id/decline')
  async declineOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.orderService.declineOrder(req.user.sub, id, data.reason, data.details);
  }

  @Patch('orders/:id/status')
  async updateCourierOrderStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(req.user.sub, id, status);
  }

  @Post('orders/:id/delivery-proof')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadDeliveryProof(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: any,
  ) {
    return this.orderService.uploadDeliveryProof(
      req.user.sub, id, file, data.notes, data.deliveryType,
    );
  }

  @Post('orders/:id/rate-customer')
  async rateCustomer(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.orderService.rateCustomer(
      req.user.sub, id, data.rating, data.tags || [], data.comment,
    );
  }

  @Get('orders/:id')
  async getOrderDetails(@Request() req: any, @Param('id') id: string) {
    return this.orderService.getOrderDetails(req.user.sub, id);
  }

  @Get('orders/available')
  async getAvailableDeliveries(@Request() req: any, @Query('filter') filter?: string) {
    return this.orderService.getAvailableDeliveries(req.user.sub, filter);
  }

  @Post('orders/:id/waiting-started')
  async markWaitingStarted(@Request() req: any, @Param('id') id: string) {
    return this.orderService.markWaitingStarted(req.user.sub, id);
  }

  @Get('orders/:id/waiting-time')
  async getWaitingTime(@Request() req: any, @Param('id') id: string) {
    return this.orderService.getWaitingTime(req.user.sub, id);
  }

  // Referral with real data
  @Get('referral')
  async getReferralInfo(@Request() req: any) {
    return this.referralService.getReferralInfo(req.user.sub, req.user.email);
  }

  @Get('referral/history')
  async getReferralHistory(@Request() req: any) {
    return this.referralService.getReferralHistory(req.user.sub);
  }

  @Post('referral/apply')
  async applyReferralCode(@Request() req: any, @Body() data: any) {
    return this.referralService.applyReferralCode(req.user.sub, data.code);
  }

  // Order History & Active Orders
  @Get('orders/history')
  async getOrderHistory(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    return this.orderService.getOrderHistory(req.user.sub, status, pageNum);
  }

  @Get('orders/active')
  async getActiveOrders(@Request() req: any) {
    return this.orderService.getActiveOrders(req.user.sub);
  }

  // Selfie Verification
  @Post('verification/selfie')
  @UseInterceptors(FileInterceptor('selfie'))
  async submitSelfie(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: any,
  ) {
    return this.verificationService.submitSelfie(req.user.sub, file, data.reason);
  }

  @Get('verification/status')
  async getVerificationStatus(@Request() req: any) {
    return this.verificationService.getStatus(req.user.sub);
  }

  @Get('verification/history')
  async getVerificationHistory(@Request() req: any) {
    return this.verificationService.getHistory(req.user.sub);
  }

  @Get('verification/requirements')
  async getVerificationRequirements(@Request() req: any) {
    return this.verificationService.getVerificationRequirements(req.user.sub);
  }
}
