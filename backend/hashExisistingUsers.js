// hashExistingUsers.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  for (let user of users) {
    // skip already hashed passwords (rough check)
    if (!user.password.startsWith("$2b$")) {
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      console.log(`Password hashed for user ${user.email}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
