import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear database
  // Update after testing
  await prisma.listing.deleteMany();

  await prisma.listing.create({
    data: {
      title: "Abbey Road",
      artist: "The Beatles",
      price: 25,
      condition: "Mint",
      imageUrl: "https://example.com/abbey-road.jpg",
      sellerId: 1
    },
  });

  await prisma.listing.create({
    data: {
      title: "Electric Ladyland",
      artist: "The Jimi Hendrix Experience",
      price: 40,
      condition: "Worn",
      imageUrl: "https://example.com/electric-ladyland.jpg",
      sellerId: 1
    },
  });

  console.log("Listings added!");
}


main().finally(() => prisma.$disconnect());
