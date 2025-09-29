import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a user
  const newUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword123', // just plain text for now
    },
  });

  console.log('Created user:', newUser);

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log('All users:', users);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
