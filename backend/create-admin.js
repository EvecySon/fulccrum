const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Admin credentials
    const email = 'admin@fulccrum.com';
    const phone = '+2348012345678';
    const password = 'Admin123!';
    const firstName = 'Admin';
    const lastName = 'User';

    console.log('🔍 Checking for existing admin user...');
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { adminUser: true }
    });

    if (user) {
      console.log('✅ Admin user already exists!');
      console.log('\n📧 Email:', email);
      console.log('📱 Phone:', phone);
      console.log('🔑 Password:', password);
      console.log('\nUser ID:', user.id);
      if (user.adminUser) {
        console.log('Admin User ID:', user.adminUser.id);
        console.log('Department:', user.adminUser.department || 'N/A');
      }
      return;
    }

    console.log('📝 Creating new admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with admin role
    user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        adminUser: {
          create: {
            department: 'Operations',
            permissions: ['all'],
          }
        }
      },
      include: {
        adminUser: true
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('📱 Phone:', phone);
    console.log('🔑 Password:', password);
    console.log('═══════════════════════════════════════');
    console.log('\nUser ID:', user.id);
    console.log('Admin User ID:', user.adminUser.id);
    console.log('Department:', user.adminUser.department);
    console.log('\n✨ You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 'P2002') {
      console.log('\n💡 User might already exist. Try logging in with:');
      console.log('   Email: admin@fulccrum.com');
      console.log('   Password: Admin123!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
