import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CommissionService } from './services/commission.service';
import { FinanceService } from './services/finance.service';
import { RefundService } from './services/refund.service';
import { PermissionsService } from './services/permissions.service';
import { AuditService } from './services/audit.service';
import { OperationsService } from './services/operations.service';
import { ModerationService } from './services/moderation.service';
import { ComplianceService } from './services/compliance.service';
import { CampaignService } from './services/campaign.service';
import { AnalyticsService } from './services/analytics.service';
import { FinanceController } from './controllers/finance.controller';
import { OperationsController } from './controllers/operations.controller';
import { RBACController } from './controllers/rbac.controller';
import { ModerationController } from './controllers/moderation.controller';
import { MarketingController } from './controllers/marketing.controller';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [PrismaModule, AuthModule, MessagingModule],
  controllers: [
    AdminController,
    FinanceController,
    OperationsController,
    RBACController,
    ModerationController,
    MarketingController,
    AnalyticsController,
  ],
  providers: [
    AdminService,
    CommissionService,
    FinanceService,
    RefundService,
    PermissionsService,
    AuditService,
    OperationsService,
    ModerationService,
    ComplianceService,
    CampaignService,
    AnalyticsService,
  ],
  exports: [
    AdminService,
    CommissionService,
    FinanceService,
    RefundService,
    PermissionsService,
    AuditService,
    OperationsService,
    ModerationService,
    ComplianceService,
    CampaignService,
    AnalyticsService,
  ],
})
export class AdminModule {}
