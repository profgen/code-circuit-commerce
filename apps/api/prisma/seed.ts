import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await argon2.hash("Admin123!Pass");
  await prisma.user.upsert({
    where: { email: "admin@codecircuit.local" },
    update: {},
    create: {
      email: "admin@codecircuit.local",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });

  await prisma.product.upsert({
    where: { slug: "wireless-headphones-pro" },
    update: {},
    create: {
      title: "Wireless Headphones Pro",
      slug: "wireless-headphones-pro",
      description: "Premium noise cancelling headphones.",
      price: 59900,
      currency: "AED",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
      categoryId: electronics.id,
      status: "APPROVED",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
