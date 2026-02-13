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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestService } from './services/quest.service';
import { SurgeService } from './services/surge.service';
import { PreferencesService } from './services/preferences.service';
import { SchedulingService } from './services/scheduling.service';
import { MaintenanceService } from './services/maintenance.service';
import { ReferralService } from './services/referral.service';
import { InsuranceService } from './services/insurance.service';
import { TrainingService } from './services/training.service';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierController {
  constructor(
    private questService: QuestService,
    private surgeService: SurgeService,
    private preferencesService: PreferencesService,
    private schedulingService: SchedulingService,
    private maintenanceService: MaintenanceService,
    private referralService: ReferralService,
    private insuranceService: InsuranceService,
    private trainingService: TrainingService,
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
  async getMonthlyEarnings(@Query('month') month: string) {
    return {
      key: month,
      label: month,
      totalEarnings: 0,
      deliveryFees: 0,
      tips: 0,
      bonuses: 0,
      deductions: 0,
      netIncome: 0,
      deliveries: 0,
      distance: 0,
    };
  }

  @Get('tax/yearly')
  async getYearlyEarnings(@Query('year') year: string) {
    return {
      year,
      totalEarnings: 0,
      deliveryFees: 0,
      tips: 0,
      bonuses: 0,
      deductions: 0,
      netIncome: 0,
      deliveries: 0,
      distance: 0,
    };
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
  async getSchedule(@Request() req: any, @Query('week') week: string) {
    return this.schedulingService.getWeekSchedule(req.user.sub, week);
  }

  @Post('schedule/book')
  async bookShift(@Request() req: any, @Body() data: any) {
    return this.schedulingService.bookShift(req.user.sub, data.slotId, data.date);
  }

  @Delete('schedule/:slotId')
  async dropShift(@Request() req: any, @Param('slotId') slotId: string) {
    return this.schedulingService.dropShift(req.user.sub, slotId);
  }

  @Get('schedule/my-shifts')
  async getMyShifts(@Request() req: any) {
    return this.schedulingService.getMyShifts(req.user.sub);
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
}
