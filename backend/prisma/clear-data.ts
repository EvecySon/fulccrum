import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function clearAllData() {
  console.log('🗑️  Starting to clear all seeded data...\n');

  try {
    // Delete in order to respect foreign key constraints
    // Start with dependent tables first, then move to parent tables

    console.log('Deleting order-related data...');
    await prisma.orderItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.order.deleteMany({});
    console.log('✅ Orders cleared');

    console.log('Deleting menu-related data...');
    await prisma.inventory.deleteMany({});
    await prisma.itemModifierLink.deleteMany({});
    await prisma.modifierOption.deleteMany({});
    await prisma.itemModifier.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.menuCategory.deleteMany({});
    console.log('✅ Menu data cleared');

    console.log('Deleting business-related data...');
    await prisma.businessHours.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.businessProfile.deleteMany({});
    console.log('✅ Business data cleared');

    console.log('Deleting driver-related data...');
    await prisma.driverLocation.deleteMany({});
    await prisma.driverProfile.deleteMany({});
    console.log('✅ Driver data cleared');

    console.log('Deleting customer-related data...');
    await prisma.customerProfile.deleteMany({});
    console.log('✅ Customer data cleared');

    console.log('Deleting wallet and financial data...');
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.digitalWallet.deleteMany({});
    await prisma.bankAccount.deleteMany({});
    await prisma.savedCard.deleteMany({});
    console.log('✅ Financial data cleared');

    console.log('Deleting support and ticket data...');
    await prisma.supportMessage.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.ticketMessage.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.agentMetrics.deleteMany({});
    console.log('✅ Support data cleared');

    console.log('Deleting notification data...');
    await prisma.notificationLog.deleteMany({});
    await prisma.pushToken.deleteMany({});
    await prisma.notificationSettings.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.deviceToken.deleteMany({});
    console.log('✅ Notification data cleared');

    console.log('Deleting user-related data...');
    await prisma.address.deleteMany({});
    await prisma.mediaFile.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.passwordReset.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.adminUser.deleteMany({});
    console.log('✅ User-related data cleared');

    console.log('Deleting all users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    console.log('\n🎉 All seeded data has been cleared successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📊 CLEARED DATA SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total users deleted: ${deletedUsers.count}`);
    console.log('✅ All admin users cleared');
    console.log('✅ All customers cleared');
    console.log('✅ All drivers/couriers cleared');
    console.log('✅ All merchants/business owners cleared');
    console.log('✅ All orders cleared');
    console.log('✅ All menu items cleared');
    console.log('✅ All wallets cleared');
    console.log('✅ All support tickets cleared');
    console.log('═══════════════════════════════════════════\n');
    console.log('💡 Run `npm run db:seed` to re-seed the database');
    console.log('');

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
