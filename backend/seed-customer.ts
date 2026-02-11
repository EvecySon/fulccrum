import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const hash = await bcrypt.hash('Test1234!', 12);

  // Delete if exists
  await prisma.user.deleteMany({ where: { email: 'customer@fulccrum.com' } }).catch(() => {});

  const user = await prisma.user.create({
    data: {
      email: 'customer@fulccrum.com',
      phone: '+2348012345678',
      passwordHash: hash,
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Create customer profile
  await prisma.customerProfile.create({
    data: {
      userId: user.id,
      preferences: {},
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
    },
  }).catch(() => {});

  // Create wallet
  await prisma.digitalWallet.create({
    data: {
      userId: user.id,
      balance: 0,
      currency: 'NGN',
    },
  }).catch(() => {});

  console.log('✅ USER CREATED:');
  console.log('  Email:    customer@fulccrum.com');
  console.log('  Password: Test1234!');
  console.log('  Role:     customer');
  console.log('  ID:      ', user.id);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
