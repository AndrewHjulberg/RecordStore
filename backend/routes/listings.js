// routes/listings.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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



// GET /listings?search=beatles&genre=rock&minPrice=10&maxPrice=50
router.get("/", async (req, res) => {
  const { search, genre, minPrice, maxPrice } = req.query;

  try {
    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { artist: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
          minPrice ? { price: { gte: parseInt(minPrice) } } : {},
          maxPrice ? { price: { lte: parseInt(maxPrice) } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

export default router;



