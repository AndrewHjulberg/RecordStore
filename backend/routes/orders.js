import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { listingId, userId } = req.body;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        userId,
        //total: listing.price, // add total if needed in schema
      },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create order", details: err.message });
  }
});


export default router;

