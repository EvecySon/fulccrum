const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'ochyboy6200@gmail.com' },
        { phone: '07066329218' }
      ]
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      status: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true
    }
  });

  console.log('User found:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

checkUser().catch(console.error);
