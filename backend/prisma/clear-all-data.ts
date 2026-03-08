import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function clearAllData() {
  console.log('🗑️  Clearing ALL data from database (including user-created data)...\n');

  try {
    // Get count before deletion
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} total users in database\n`);

    // Delete ALL data in correct order
    console.log('Step 1: Deleting all order-related data...');
    await prisma.deliveryProof.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.chargeback.deleteMany({});
    await prisma.refund.deleteMany({});
    await prisma.platformRevenue.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.order.deleteMany({});
    console.log('✅ All orders and related data deleted');

    console.log('Step 2: Deleting all menu and inventory data...');
    await prisma.inventory.deleteMany({});
    await prisma.itemModifierLink.deleteMany({});
    await prisma.modifierOption.deleteMany({});
    await prisma.itemModifier.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.menuCategory.deleteMany({});
    console.log('✅ All menu data deleted');

    console.log('Step 3: Deleting all business/merchant data...');
    await prisma.merchantActivityLog.deleteMany({});
    await prisma.merchantCompliance.deleteMany({});
    await prisma.merchantCommission.deleteMany({});
    await prisma.marketplaceListing.deleteMany({});
    await prisma.merchantCustomerProfile.deleteMany({});
    await prisma.merchantAiInsight.deleteMany({});
    await prisma.kitchenOperation.deleteMany({});
    await prisma.loyaltyProgram.deleteMany({});
    await prisma.pricingRule.deleteMany({});
    await prisma.merchantSubscription.deleteMany({});
    await prisma.merchantChannel.deleteMany({});
    await prisma.flashSale.deleteMany({});
    await prisma.crmCustomerNote.deleteMany({});
    await prisma.crmCampaign.deleteMany({});
    await prisma.businessHours.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.businessProfile.deleteMany({});
    console.log('✅ All business data deleted');

    console.log('Step 4: Deleting all driver/courier data...');
    await prisma.scheduleNoShow.deleteMany({});
    await prisma.verificationAttempt.deleteMany({});
    await prisma.courierTrainingProgress.deleteMany({});
    await prisma.maintenanceLog.deleteMany({});
    await prisma.insuranceClaim.deleteMany({});
    await prisma.referral.deleteMany({});
    await prisma.courierPreferences.deleteMany({});
    await prisma.courierQuestProgress.deleteMany({});
    await prisma.courierScheduleSlot.deleteMany({});
    await prisma.driverLocation.deleteMany({});
    await prisma.driverProfile.deleteMany({});
    console.log('✅ All driver data deleted');

    console.log('Step 5: Deleting all customer data...');
    await prisma.customerLoyalty.deleteMany({});
    await prisma.groupOrderMember.deleteMany({});
    await prisma.groupOrder.deleteMany({});
    await prisma.customerProfile.deleteMany({});
    console.log('✅ All customer data deleted');

    console.log('Step 6: Deleting all financial data...');
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.digitalWallet.deleteMany({});
    await prisma.bankAccount.deleteMany({});
    await prisma.savedCard.deleteMany({});
    console.log('✅ All financial data deleted');

    console.log('Step 7: Deleting all support/ticket data...');
    await prisma.ticketMessage.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.agentMetrics.deleteMany({});
    await prisma.supportMessage.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    console.log('✅ All support data deleted');

    console.log('Step 8: Deleting all notification data...');
    await prisma.notificationLog.deleteMany({});
    await prisma.notificationTemplate.deleteMany({});
    await prisma.pushToken.deleteMany({});
    await prisma.notificationSettings.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.deviceToken.deleteMany({});
    console.log('✅ All notification data deleted');

    console.log('Step 9: Deleting all audit and admin data...');
    await prisma.auditLog.deleteMany({});
    await prisma.adminUser.deleteMany({});
    console.log('✅ All audit data deleted');

    console.log('Step 10: Deleting all user-related data...');
    await prisma.document.deleteMany({});
    await prisma.passwordReset.deleteMany({});
    await prisma.mediaFile.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    console.log('✅ All user-related data deleted');

    console.log('Step 11: Deleting ALL users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    console.log('Step 12: Deleting platform settings and other data...');
    await prisma.platformSettings.deleteMany({});
    await prisma.promoCode.deleteMany({});
    await prisma.deliveryZone.deleteMany({});
    console.log('✅ All platform data deleted');

    console.log('\n🎉 DATABASE COMPLETELY CLEARED!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📊 DELETION SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total users deleted: ${deletedUsers.count}`);
    console.log('✅ ALL seeded data removed');
    console.log('✅ ALL user-created data removed');
    console.log('✅ ALL orders removed');
    console.log('✅ ALL transactions removed');
    console.log('✅ ALL profiles removed');
    console.log('✅ ALL login sessions removed');
    console.log('✅ Database is now EMPTY');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

clearAllData()
  .catch((e) => {
    console.error('❌ Clear failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
