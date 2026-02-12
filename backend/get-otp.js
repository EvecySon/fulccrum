const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function getLatestOTP(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      status: true,
      emailVerificationToken: true,
      emailVerificationExpires: true,
    },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('\n=== User Info ===');
  console.log('Email:', user.email);
  console.log('Name:', user.firstName);
  console.log('Status:', user.status);
  console.log('\n=== OTP Info ===');
  console.log('OTP Code:', user.emailVerificationToken);
  console.log('Expires:', user.emailVerificationExpires);
  console.log('Still Valid:', user.emailVerificationExpires > new Date());

  await prisma.$disconnect();
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node get-otp.js <email>');
  process.exit(1);
}

getLatestOTP(email);
