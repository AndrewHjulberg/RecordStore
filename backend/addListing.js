import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.listing.create({
    data: {
      title: "Abbey Road",
      artist: "The Beatles",
      price: 25,
      condition: "Mint",
      imageUrl: "https://example.com/abbey-road.jpg",
      sellerId: 1 // admin user id
    },
  });
  console.log("Listing added!");
}

main().finally(() => prisma.$disconnect());
