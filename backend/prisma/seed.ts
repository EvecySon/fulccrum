import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // Check if already seeded
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@fulccrum.com' },
  });

  if (existingAdmin) {
    console.log('⚠️  Database already seeded. Run `npm run db:reset` to reset and reseed.\n');
    return;
  }

  const passwordHash = await bcrypt.hash('Test123!', 12);

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fulccrum.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+2348012345678',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}\n`);

  // ============================================
  // 2. CREATE TEST CUSTOMERS
  // ============================================
  console.log('👥 Creating test customers...');
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'customer1@test.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348023456789',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer2@test.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+2348034567890',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer3@test.com',
        passwordHash,
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+2348045678901',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${customers.length} customers\n`);

  // ============================================
  // 3. CREATE TEST DRIVERS
  // ============================================
  console.log('🏍️  Creating test drivers...');
  const drivers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'driver1@test.com',
        passwordHash,
        firstName: 'David',
        lastName: 'Wilson',
        phone: '+2348056789012',
        role: 'driver',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'driver2@test.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Brown',
        phone: '+2348067890123',
        role: 'driver',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${drivers.length} drivers\n`);

  // ============================================
  // 4. CREATE TEST RESTAURANTS/BUSINESSES
  // ============================================
  console.log('🏪 Creating test restaurants...');
  
  // Restaurant 1: Pizza Place
  const pizzaOwner = await prisma.user.create({
    data: {
      email: 'pizza@test.com',
      passwordHash,
      firstName: 'Tony',
      lastName: 'Pizza',
      phone: '+2348078901234',
      role: 'business_owner',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const pizzaPlace = await prisma.businessProfile.create({
    data: {
      userId: pizzaOwner.id,
      businessName: 'Tony\'s Pizza Palace',
      businessType: 'restaurant',
      description: 'Authentic Italian pizza made with love',
      email: 'orders@tonyspizza.com',
      phone: '+2348078901234',
      address: '123 Pizza Street, Lekki, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      deliveryRadius: 10,
      minimumOrderAmount: 2000,
      averagePreparationTime: 30,
    },
  });

  // Restaurant 2: Burger Joint
  const burgerOwner = await prisma.user.create({
    data: {
      email: 'burger@test.com',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Burger',
      phone: '+2348089012345',
      role: 'business_owner',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const burgerJoint = await prisma.businessProfile.create({
    data: {
      userId: burgerOwner.id,
      businessName: 'Bob\'s Burger Joint',
      businessType: 'restaurant',
      description: 'Juicy burgers and crispy fries',
      email: 'orders@bobsburgers.com',
      phone: '+2348089012345',
      address: '456 Burger Avenue, Victoria Island, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      deliveryRadius: 8,
      minimumOrderAmount: 1500,
      averagePreparationTime: 25,
    },
  });

  // Restaurant 3: Nigerian Food
  const jollofOwner = await prisma.user.create({
    data: {
      email: 'jollof@test.com',
      passwordHash,
      firstName: 'Mama',
      lastName: 'Jollof',
      phone: '+2348090123456',
      role: 'business_owner',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const jollofSpot = await prisma.businessProfile.create({
    data: {
      userId: jollofOwner.id,
      businessName: 'Mama Jollof\'s Kitchen',
      businessType: 'restaurant',
      description: 'Authentic Nigerian cuisine',
      email: 'orders@mamajollof.com',
      phone: '+2348090123456',
      address: '789 Jollof Road, Ikeja, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      deliveryRadius: 12,
      minimumOrderAmount: 1000,
      averagePreparationTime: 35,
    },
  });

  console.log(`✅ Created 3 restaurants\n`);

  // ============================================
  // 5. CREATE MENU CATEGORIES & ITEMS
  // ============================================
  console.log('📋 Creating menu categories and items...');

  // PIZZA PLACE MENU
  const pizzaCategories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        businessId: pizzaPlace.userId,
        name: 'Pizzas',
        description: 'Our signature pizzas',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: pizzaPlace.userId,
        name: 'Sides',
        description: 'Perfect complements',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: pizzaPlace.userId,
        name: 'Drinks',
        description: 'Refreshing beverages',
        displayOrder: 3,
        isActive: true,
      },
    }),
  ]);

  const pizzaItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[0].id,
        name: 'Margherita Pizza',
        description: 'Classic tomato, mozzarella, and basil',
        price: 3500,
        isAvailable: true,
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[0].id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and cheese',
        price: 4500,
        isAvailable: true,
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[0].id,
        name: 'BBQ Chicken Pizza',
        description: 'Grilled chicken with BBQ sauce',
        price: 5000,
        isAvailable: true,
        preparationTime: 25,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[1].id,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 1500,
        isAvailable: true,
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[1].id,
        name: 'Chicken Wings',
        description: '6 pieces of spicy wings',
        price: 2500,
        isAvailable: true,
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: pizzaPlace.userId,
        categoryId: pizzaCategories[2].id,
        name: 'Coca Cola',
        description: '50cl bottle',
        price: 500,
        isAvailable: true,
        preparationTime: 1,
      },
    }),
  ]);

  // BURGER JOINT MENU
  const burgerCategories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        businessId: burgerJoint.userId,
        name: 'Burgers',
        description: 'Juicy beef burgers',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: burgerJoint.userId,
        name: 'Sides',
        description: 'Fries and more',
        displayOrder: 2,
        isActive: true,
      },
    }),
  ]);

  const burgerItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        businessId: burgerJoint.userId,
        categoryId: burgerCategories[0].id,
        name: 'Classic Burger',
        description: 'Beef patty, lettuce, tomato, onion',
        price: 3000,
        isAvailable: true,
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: burgerJoint.userId,
        categoryId: burgerCategories[0].id,
        name: 'Cheese Burger',
        description: 'With melted cheddar cheese',
        price: 3500,
        isAvailable: true,
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: burgerJoint.userId,
        categoryId: burgerCategories[0].id,
        name: 'Double Burger',
        description: 'Two beef patties, double cheese',
        price: 5000,
        isAvailable: true,
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: burgerJoint.userId,
        categoryId: burgerCategories[1].id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 1500,
        isAvailable: true,
        preparationTime: 10,
      },
    }),
  ]);

  // NIGERIAN FOOD MENU
  const jollofCategories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        businessId: jollofSpot.userId,
        name: 'Rice Dishes',
        description: 'Nigerian rice specialties',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: jollofSpot.userId,
        name: 'Proteins',
        description: 'Chicken, fish, and beef',
        displayOrder: 2,
        isActive: true,
      },
    }),
  ]);

  const jollofItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        businessId: jollofSpot.userId,
        categoryId: jollofCategories[0].id,
        name: 'Jollof Rice',
        description: 'Spicy Nigerian jollof rice',
        price: 2000,
        isAvailable: true,
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: jollofSpot.userId,
        categoryId: jollofCategories[0].id,
        name: 'Fried Rice',
        description: 'Mixed vegetable fried rice',
        price: 2500,
        isAvailable: true,
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: jollofSpot.userId,
        categoryId: jollofCategories[1].id,
        name: 'Grilled Chicken',
        description: 'Full chicken grilled to perfection',
        price: 3500,
        isAvailable: true,
        preparationTime: 25,
      },
    }),
    prisma.menuItem.create({
      data: {
        businessId: jollofSpot.userId,
        categoryId: jollofCategories[1].id,
        name: 'Fried Fish',
        description: 'Crispy fried tilapia',
        price: 3000,
        isAvailable: true,
        preparationTime: 20,
      },
    }),
  ]);

  console.log(`✅ Created menu categories and items\n`);

  // ============================================
  // 6. CREATE INVENTORY FOR ITEMS
  // ============================================
  console.log('📦 Creating inventory...');
  
  const allItems = [...pizzaItems, ...burgerItems, ...jollofItems];
  await Promise.all(
    allItems.map((item) =>
      prisma.inventory.create({
        data: {
          businessId: item.businessId,
          itemId: item.id,
          currentStock: 50,
          minimumStock: 10,
          unit: 'pieces',
        },
      })
    )
  );

  console.log(`✅ Created inventory for ${allItems.length} items\n`);

  // ============================================
  // 7. CREATE SAMPLE ADDRESSES
  // ============================================
  console.log('📍 Creating sample addresses...');
  
  await Promise.all([
    prisma.address.create({
      data: {
        user: { connect: { id: customers[0].id } },
        label: 'Home',
        streetAddress: '10 Allen Avenue',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '100001',
        country: 'Nigeria',
        latitude: 6.4698,
        longitude: 3.3852,
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        user: { connect: { id: customers[1].id } },
        label: 'Home',
        streetAddress: '25 Admiralty Way',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '101233',
        country: 'Nigeria',
        latitude: 6.4281,
        longitude: 3.4219,
      },
    }),
  ]);

  console.log(`✅ Created 2 sample addresses\n`);

  // ============================================
  // 8. CREATE WALLETS WITH TEST BALANCES
  // ============================================
  console.log('💰 Creating wallets with test balances...');
  
  // Create wallets for customers
  await Promise.all([
    prisma.digitalWallet.create({
      data: {
        userId: customers[0].id,
        balance: 50000, // ₦50,000
        currency: 'NGN',
      },
    }),
    prisma.digitalWallet.create({
      data: {
        userId: customers[1].id,
        balance: 30000, // ₦30,000
        currency: 'NGN',
      },
    }),
    prisma.digitalWallet.create({
      data: {
        userId: customers[2].id,
        balance: 20000, // ₦20,000
        currency: 'NGN',
      },
    }),
  ]);

  // Create wallets for drivers
  await Promise.all([
    prisma.digitalWallet.create({
      data: {
        userId: drivers[0].id,
        balance: 15000, // ₦15,000
        currency: 'NGN',
      },
    }),
    prisma.digitalWallet.create({
      data: {
        userId: drivers[1].id,
        balance: 10000, // ₦10,000
        currency: 'NGN',
      },
    }),
  ]);

  // Create wallets for restaurant owners
  await Promise.all([
    prisma.digitalWallet.create({
      data: {
        userId: pizzaOwner.id,
        balance: 100000, // ₦100,000
        currency: 'NGN',
      },
    }),
    prisma.digitalWallet.create({
      data: {
        userId: burgerOwner.id,
        balance: 75000, // ₦75,000
        currency: 'NGN',
      },
    }),
    prisma.digitalWallet.create({
      data: {
        userId: jollofOwner.id,
        balance: 50000, // ₦50,000
        currency: 'NGN',
      },
    }),
  ]);

  // Create wallet for admin
  await prisma.digitalWallet.create({
    data: {
      userId: admin.id,
      balance: 1000000, // ₦1,000,000 for testing
      currency: 'NGN',
    },
  });

  console.log(`✅ Created wallets for all users with test balances\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SEED DATA SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log('👤 Admin User:');
  console.log('   Email: admin@fulccrum.com');
  console.log('   Password: Test123!');
  console.log('   💰 Wallet: ₦1,000,000');
  console.log('');
  console.log('👥 Test Customers: 3');
  console.log('   customer1@test.com - Test123! (₦50,000)');
  console.log('   customer2@test.com - Test123! (₦30,000)');
  console.log('   customer3@test.com - Test123! (₦20,000)');
  console.log('');
  console.log('🏍️  Test Drivers: 2');
  console.log('   driver1@test.com - Test123! (₦15,000)');
  console.log('   driver2@test.com - Test123! (₦10,000)');
  console.log('');
  console.log('🏪 Restaurant Owners: 3');
  console.log('   pizza@test.com - Test123! (₦100,000)');
  console.log('   burger@test.com - Test123! (₦75,000)');
  console.log('   jollof@test.com - Test123! (₦50,000)');
  console.log('');
  console.log('🏪 Restaurants: 3');
  console.log('   1. Tony\'s Pizza Palace (Italian)');
  console.log('   2. Bob\'s Burger Joint (American)');
  console.log('   3. Mama Jollof\'s Kitchen (Nigerian)');
  console.log('');
  console.log('📋 Menu Items: ' + allItems.length);
  console.log('📦 Inventory: All items stocked (50 units each)');
  console.log('💰 Wallets: All users funded with test balances');
  console.log('═══════════════════════════════════════════\n');

  // ============================================
  // CREATE PLATFORM SETTINGS
  // ============================================
  console.log('⚙️  Creating platform settings...');
  const platformSettings = await prisma.platformSettings.create({
    data: {
      serviceFeePercentage: 10,
      minServiceFee: 50,
      maxServiceFee: 500,
      taxPercentage: 7.5,
      taxName: 'VAT',
      platformCommissionPercentage: 15,
      currency: 'NGN',
      isActive: true,
      // Package Delivery Pricing
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
  console.log('✅ Platform settings created with default package delivery pricing\n');

  console.log('✅ You can now test the complete order flow with wallet payments!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
