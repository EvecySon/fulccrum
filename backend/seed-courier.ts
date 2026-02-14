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
  await prisma.user.deleteMany({ where: { OR: [{ email: 'courier@fulccrum.com' }, { phone: '+2348099999999' }] } }).catch(() => {});

  const user = await prisma.user.create({
    data: {
      email: 'courier@fulccrum.com',
      phone: '+2348099999999',
      passwordHash: hash,
      firstName: 'Test',
      lastName: 'Courier',
      role: 'driver',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Create driver profile
  await prisma.driverProfile.create({
    data: {
      userId: user.id,
      vehicleType: 'motorcycle',
      vehicleMake: 'Honda',
      vehicleModel: 'CG125',
      vehicleYear: 2023,
      vehicleColor: 'Red',
      licensePlate: 'LAG-123-XY',
      backgroundCheckStatus: 'approved',
      rating: 4.8,
      totalDeliveries: 250,
      onlineStatus: false,
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

  console.log('✅ COURIER CREATED:');
  console.log('  Email:    courier@fulccrum.com');
  console.log('  Password: Test1234!');
  console.log('  Role:     driver (courier)');
  console.log('  Rating:   4.8 (Excellent tier — 7 days booking)');
  console.log('  Deliveries: 250');
  console.log('  ID:      ', user.id);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
