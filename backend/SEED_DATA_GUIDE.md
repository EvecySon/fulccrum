# 🌱 Seed Data Guide

## What Changed

I've created **comprehensive seed data** with realistic test data so you can properly test the order flow.

---

## What's Included in Seed Data

### **Users:**
- ✅ 1 Admin user
- ✅ 3 Test customers
- ✅ 2 Test drivers
- ✅ 3 Restaurant owners

### **Restaurants:**
1. **Tony's Pizza Palace** (Italian)
   - Pizzas, Sides, Drinks
   - 6 menu items

2. **Bob's Burger Joint** (American)
   - Burgers, Sides
   - 4 menu items

3. **Mama Jollof's Kitchen** (Nigerian)
   - Rice Dishes, Proteins
   - 4 menu items

### **Total:**
- 📋 14 menu items with prices
- 📦 All items have inventory (50 units each)
- 📍 Sample delivery addresses
- 💰 Realistic prices in Naira

---

## How to Seed the Database

### **Step 1: Start Database**
```bash
# Make sure Docker is running, then:
docker-compose up -d postgres redis
```

### **Step 2: Reset and Seed**
```bash
cd backend
npm run db:reset
```

This will:
1. Drop all tables
2. Run all migrations
3. Seed with test data

### **Step 3: Verify**
You should see:
```
🌱 Starting comprehensive database seed...

👤 Creating admin user...
✅ Admin created: admin@fulccrum.com

👥 Creating test customers...
✅ Created 3 customers

🏍️  Creating test drivers...
✅ Created 2 drivers

🏪 Creating test restaurants...
✅ Created 3 restaurants

📋 Creating menu categories and items...
✅ Created menu categories and items

📦 Creating inventory...
✅ Created inventory for 14 items

📍 Creating sample addresses...
✅ Created sample addresses

🎉 Database seeded successfully!
```

---

## Test Accounts

### **Admin:**
```
Email: admin@fulccrum.com
Password: Test123!
```

### **Customers:**
```
Email: customer1@test.com
Password: Test123!

Email: customer2@test.com
Password: Test123!

Email: customer3@test.com
Password: Test123!
```

### **Drivers:**
```
Email: driver1@test.com
Password: Test123!

Email: driver2@test.com
Password: Test123!
```

### **Restaurant Owners:**
```
Email: pizza@test.com
Password: Test123!

Email: burger@test.com
Password: Test123!

Email: jollof@test.com
Password: Test123!
```

---

## Testing the Order Flow

### **1. Login as Customer**
```bash
POST /auth/login
{
  "email": "customer1@test.com",
  "password": "Test123!"
}
```

### **2. Browse Restaurants**
```bash
GET /api/business?city=Lagos
```

### **3. View Menu**
```bash
GET /api/menu/business/{businessId}/categories
```

### **4. Create Order**
```bash
POST /api/orders
{
  "businessId": "{pizzaPlaceId}",
  "items": [
    {
      "menuItemId": "{margheritaPizzaId}",
      "quantity": 2
    }
  ],
  "deliveryAddressId": "{customerAddressId}",
  "deliveryFee": 500,
  "specialInstructions": "Extra cheese please"
}
```

### **5. Initialize Payment**
```bash
POST /api/payment/initialize
Headers: {
  "Idempotency-Key": "unique-key-123"
}
{
  "orderId": "{orderId}",
  "amount": 7500
}
```

---

## Sample Menu Items with IDs

After seeding, you can query to get IDs:

```sql
-- Get all restaurants
SELECT id, name, cuisineType FROM "Business";

-- Get menu items for a restaurant
SELECT id, name, price FROM "MenuItem" WHERE "businessId" = '{businessId}';

-- Get customer addresses
SELECT id, label, street FROM "Address" WHERE "userId" = '{customerId}';
```

---

## What's Fixed

### **Before (Empty Database):**
- ❌ No restaurants
- ❌ No menu items
- ❌ Can't test orders
- ❌ Orders fail silently

### **After (Seeded Database):**
- ✅ 3 restaurants with menus
- ✅ 14 menu items with prices
- ✅ Inventory tracking
- ✅ Can test complete order flow
- ✅ Realistic test scenario

---

## Troubleshooting

### **Error: Can't reach database**
```bash
# Start database
docker-compose up -d postgres

# Wait 5 seconds, then try again
npm run db:reset
```

### **Error: Already seeded**
```bash
# This is normal - just use db:reset to clear and reseed
npm run db:reset
```

### **Want to add more data?**
Edit `prisma/seed.ts` and add more:
- Restaurants
- Menu items
- Customers
- Addresses

Then run:
```bash
npm run db:reset
```

---

## Next Steps

After seeding:

1. ✅ **Test browsing restaurants** - Should see 3 restaurants
2. ✅ **Test viewing menus** - Should see items with prices
3. ✅ **Test creating orders** - Should work with real data
4. ✅ **Test payment flow** - Should initialize payment properly
5. ✅ **Test stock tracking** - Should decrement inventory

---

## Production Note

⚠️ **This seed data is ONLY for development/testing!**

In production:
- Real restaurants register via admin panel
- Real menu items added by restaurant owners
- Real customers sign up
- Real orders from real users

The seed script **never runs in production**.

---

**Ready to test!** 🚀

Run `npm run db:reset` when your database is running.
