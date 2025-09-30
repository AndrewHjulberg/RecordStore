// routes/listings.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET all listings
router.get("/", async (req, res) => {
  try {
    const listings = await prisma.listing.findMany();
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


