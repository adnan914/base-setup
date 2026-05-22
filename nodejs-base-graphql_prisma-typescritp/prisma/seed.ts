import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.create({
    data: {
      user_name: 'user1',
      email: 'user1@example.com',
      password: 'password1', 
      role: 'USER',
    },
  });

  await prisma.user.create({
    data: {
      user_name: 'user2',
      email: 'user2@example.com',
      password: 'password2', 
      role: 'USER',
    },
  });

  await prisma.attendance.create({
    data: {
      userId: 1, 
      date: new Date(),
      status: 'Present',
    },
  });

  await prisma.attendance.create({
    data: {
      userId: 2, 
      date: new Date(),
      status: 'Absent',
    },
  });
}

async function main() {
  try {
    await seed();
    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
