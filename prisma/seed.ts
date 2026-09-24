import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@badc.club";
  const password = "badc@2026"; // THIS WILL BE YOUR PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // This deletes any existing user with this email and creates a fresh one
  await prisma.user.upsert({
    where: { email: email },
    update: {
      hashedPassword: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: email,
      name: "BADC Admin",
      hashedPassword: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("-----------------------------------------");
  console.log("Admin account created/updated successfully!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
