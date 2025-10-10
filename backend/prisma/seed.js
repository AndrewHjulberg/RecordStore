// seedAdmin.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.com";
  const plainPassword = "123456"; // your admin password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Upsert admin user
  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, isAdmin: true },
    create: { email, password: hashedPassword, isAdmin: true },
  });

  console.log("Admin user created/updated with hashed password!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
