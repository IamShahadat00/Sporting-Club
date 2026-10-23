
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@badc.club";
  const password = "badc@2026";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      hashedPassword: hashedPassword,
      role: "ADMIN",
      isApproved: true,
    },
    create: {
      email: email.toLowerCase(),
      name: "BADC Admin",
      hashedPassword: hashedPassword,
      role: "ADMIN",
      isApproved: true,
    },
  });

  console.log("-----------------------------------------");
  console.log("Admin account created/verified successfully!");
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${admin.role}`);
  console.log(`Approved: ${admin.isApproved}`);
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
