import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotificationTemplates() {
  console.log('🔔 Seeding notification templates...');

  const templates = [
    // Customer Engagement - Morning
    {
      key: 'customer_engagement_morning_1',
      name: 'Morning Engagement - Wake Up',
      title: '🍕 Wake Up!',
      body: "Today won't order itself. Let's get you something tasty!",
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      isDefault: true,
    },
    {
      key: 'customer_engagement_morning_2',
      name: 'Morning Engagement - Hungry Yet',
      title: '😋 Hungry Yet?',
      body: 'Time to order something hot and delicious!',
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      variant: 'A',
    },
    {
      key: 'customer_engagement_morning_3',
      name: 'Morning Engagement - Craving Alert',
      title: '🔥 Craving Alert!',
      body: "Aren't you hungry yet? Your favorite meals are waiting!",
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      variant: 'B',
    },

    // Meal Time Reminders
    {
      key: 'meal_reminder_breakfast',
      name: 'Breakfast Reminder',
      title: '🌅 Good Morning, {userName}!',
      body: 'Start your day right with a delicious breakfast!',
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 8 * * *',
      isDefault: true,
    },
    {
      key: 'meal_reminder_lunch',
      name: 'Lunch Reminder',
      title: '☀️ Lunch Time!',
      body: "It's lunch o'clock! Order something hot and tasty!",
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 12 * * *',
      isDefault: true,
    },
    {
      key: 'meal_reminder_dinner',
      name: 'Dinner Reminder',
      title: '🌙 Dinner Time!',
      body: 'End your day with a satisfying meal delivered to you!',
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 18 * * *',
      isDefault: true,
    },

    // Merchant Reminders
    {
      key: 'merchant_opening_reminder_1',
      name: 'Store Opening - Dont Keep Hungry',
      title: '🏪 Time to Open!',
      body: "Don't keep people hungry! Your customers are waiting.",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['business_owner'],
      variantGroup: 'merchant_opening_reminder',
      isDefault: true,
    },
    {
      key: 'merchant_opening_reminder_2',
      name: 'Store Opening - Ready to Cook',
      title: '👨‍🍳 Ready to Cook?',
      body: "It's time to open your store and serve delicious meals!",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['business_owner'],
      variantGroup: 'merchant_opening_reminder',
      variant: 'A',
    },
    {
      key: 'merchant_opening_reminder_3',
      name: 'Store Opening - People Hungry',
      title: '🍽️ People Are Hungry!',
      body: "Don't forget to open your store and start serving!",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['business_owner'],
      variantGroup: 'merchant_opening_reminder',
      variant: 'B',
    },
    {
      key: 'merchant_pending_orders',
      name: 'Pending Orders Alert',
      title: '🛎️ Orders Waiting!',
      body: "You have {pendingOrdersCount} pending orders. Don't keep customers waiting!",
      type: 'alert',
      category: 'merchant',
      targetRole: ['business_owner'],
      isDefault: true,
    },
    {
      key: 'merchant_daily_summary',
      name: 'Merchant Daily Summary',
      title: '📊 Daily Summary',
      body: 'Today: {ordersToday} orders, ₦{earningsToday} earned. Great job!',
      type: 'informational',
      category: 'merchant',
      targetRole: ['business_owner'],
      isDefault: true,
    },

    // Driver Reminders
    {
      key: 'driver_shift_reminder',
      name: 'Driver Shift Reminder',
      title: '🚗 Ready to Earn?',
      body: 'Go online and start accepting deliveries!',
      type: 'reminder',
      category: 'driver',
      targetRole: ['driver'],
      isDefault: true,
    },
    {
      key: 'driver_peak_hours',
      name: 'Driver Peak Hours Alert',
      title: '🔥 Peak Hours Alert!',
      body: 'High demand now! Earn up to ₦{expectedEarnings} per hour!',
      type: 'alert',
      category: 'driver',
      targetRole: ['driver'],
      isDefault: true,
    },

    // Re-engagement
    {
      key: 'customer_inactive_reengagement',
      name: 'Inactive User Re-engagement',
      title: '😢 We Miss You!',
      body: "It's been {daysSinceLastOrder} days! Come back for your favorites!",
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      isDefault: true,
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { key: template.key },
      update: template as any,
      create: template as any,
    });
  }

  console.log(`✅ Created ${templates.length} notification templates\n`);
}

seedNotificationTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
