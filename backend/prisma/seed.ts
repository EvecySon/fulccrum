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

  const pizzaPlace = await prisma.business.create({
    data: {
      name: 'Tony\'s Pizza Palace',
      description: 'Authentic Italian pizza made with love',
      email: 'orders@tonyspizza.com',
      phone: '+2348078901234',
      address: '123 Pizza Street, Lekki, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4281,
      longitude: 3.4219,
      ownerId: pizzaOwner.id,
      status: 'active',
      isVerified: true,
      cuisineType: 'Italian',
      openingTime: '10:00',
      closingTime: '22:00',
      deliveryRadius: 10,
      minimumOrder: 2000,
      averageDeliveryTime: 30,
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

  const burgerJoint = await prisma.business.create({
    data: {
      name: 'Bob\'s Burger Joint',
      description: 'Juicy burgers and crispy fries',
      email: 'orders@bobsburgers.com',
      phone: '+2348089012345',
      address: '456 Burger Avenue, Victoria Island, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4281,
      longitude: 3.4219,
      ownerId: burgerOwner.id,
      status: 'active',
      isVerified: true,
      cuisineType: 'American',
      openingTime: '11:00',
      closingTime: '23:00',
      deliveryRadius: 8,
      minimumOrder: 1500,
      averageDeliveryTime: 25,
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

  const jollofSpot = await prisma.business.create({
    data: {
      name: 'Mama Jollof\'s Kitchen',
      description: 'Authentic Nigerian cuisine',
      email: 'orders@mamajollof.com',
      phone: '+2348090123456',
      address: '789 Jollof Road, Ikeja, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.6018,
      longitude: 3.3515,
      ownerId: jollofOwner.id,
      status: 'active',
      isVerified: true,
      cuisineType: 'Nigerian',
      openingTime: '09:00',
      closingTime: '21:00',
      deliveryRadius: 12,
      minimumOrder: 1000,
      averageDeliveryTime: 35,
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
        businessId: pizzaPlace.id,
        name: 'Pizzas',
        description: 'Our signature pizzas',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: pizzaPlace.id,
        name: 'Sides',
        description: 'Perfect complements',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: pizzaPlace.id,
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
        businessId: burgerJoint.id,
        name: 'Burgers',
        description: 'Juicy beef burgers',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: burgerJoint.id,
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
        businessId: burgerJoint.id,
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
        businessId: burgerJoint.id,
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
        businessId: burgerJoint.id,
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
        businessId: burgerJoint.id,
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
        businessId: jollofSpot.id,
        name: 'Rice Dishes',
        description: 'Nigerian rice specialties',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.create({
      data: {
        businessId: jollofSpot.id,
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
        businessId: jollofSpot.id,
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
        businessId: jollofSpot.id,
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
        businessId: jollofSpot.id,
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
        businessId: jollofSpot.id,
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
          itemId: item.id,
          currentStock: 50,
          minimumStock: 10,
          trackStock: true,
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
        userId: customers[0].id,
        label: 'Home',
        street: '10 Allen Avenue',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.4698,
        longitude: 3.3852,
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[1].id,
        label: 'Home',
        street: '25 Admiralty Way',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.4281,
        longitude: 3.4219,
        isDefault: true,
      },
    }),
  ]);

  console.log(`✅ Created sample addresses\n`);

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
  console.log('');
  console.log('👥 Test Customers: 3');
  console.log('   customer1@test.com - Test123!');
  console.log('   customer2@test.com - Test123!');
  console.log('   customer3@test.com - Test123!');
  console.log('');
  console.log('🏍️  Test Drivers: 2');
  console.log('   driver1@test.com - Test123!');
  console.log('   driver2@test.com - Test123!');
  console.log('');
  console.log('🏪 Restaurants: 3');
  console.log('   1. Tony\'s Pizza Palace (Italian)');
  console.log('   2. Bob\'s Burger Joint (American)');
  console.log('   3. Mama Jollof\'s Kitchen (Nigerian)');
  console.log('');
  console.log('📋 Menu Items: ' + allItems.length);
  console.log('📦 Inventory: All items stocked (50 units each)');
  console.log('═══════════════════════════════════════════\n');
  console.log('✅ You can now test the complete order flow!');
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
