// routes/listings.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Middleware to check admin
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ✅ POST route to add a listing
router.post("/", requireAdmin, async (req, res) => {
  const { title, artist, price, condition, imageUrl } = req.body;

  try {
    const listing = await prisma.listing.create({
      data: { title, artist, price: parseFloat(price), condition, imageUrl },
    });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create listing" });
  }
});

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


