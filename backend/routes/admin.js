import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router(); // Make sure this exists
const prisma = new PrismaClient();

const ADMIN_SECRET = process.env.ADMIN_SECRET || "mysecret";

// Add a new listing (admin-only)
router.post("/listings", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });

  try {
    const listing = await prisma.listing.create({ data: req.body });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export the router as default
export default router;
