const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cascade_dev'
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function createSettings() {
  try {
    const existing = await prisma.platformSettings.findFirst();
    if (existing) {
      console.log('✅ PlatformSettings already exists with ID:', existing.id);
      console.log('Current values:', {
        basePackagePrice: existing.basePackagePrice.toString(),
        perKmPackageRate: existing.perKmPackageRate.toString(),
      });
      return;
    }
    
    const settings = await prisma.platformSettings.create({
      data: {
        serviceFeePercentage: 10,
        minServiceFee: 50,
        maxServiceFee: 500,
        taxPercentage: 7.5,
        taxName: 'VAT',
        platformCommissionPercentage: 15,
        currency: 'NGN',
        isActive: true,
        basePackagePrice: 500,
        perKmPackageRate: 100,
        packageSizeSmallMultiplier: 1.0,
        packageSizeMediumMultiplier: 1.5,
        packageSizeLargeMultiplier: 2.0,
        expressSpeedMultiplier: 1.3,
        sameDaySpeedMultiplier: 1.0,
        scheduledSpeedMultiplier: 0.8,
        peakHourSurgeMultiplier: 1.3,
        weekendSurgeMultiplier: 1.2,
      },
    });
    console.log('✅ Created PlatformSettings with ID:', settings.id);
    console.log('Package delivery pricing initialized with defaults');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createSettings();
