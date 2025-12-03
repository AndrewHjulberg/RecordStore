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

// ✅ POST route to add a listing (INT-friendly)
router.post("/", requireAdmin, async (req, res) => {
  const {
    title,
    artist,
    genre,
    price,
    condition,
    imageUrl,
    featured,
    onSale,
    salePrice,
    releaseYear,
  } = req.body;

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        artist,
        genre,
        price: parseInt(price),
        condition,
        imageUrl,
        featured: !!featured,
        onSale: !!onSale,
        salePrice: onSale ? parseInt(salePrice) : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
      },
    });

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create listing" });
  }
});


// ✅ GET /listings — now supports decade filtering
router.get("/", async (req, res) => {
  const {
    search,
    genre,
    minPrice,
    maxPrice,
    featured,
    onSale,
    releaseYear,
    minYear,
    maxYear,
    decade, // 👈 NEW
  } = req.query;

  try {
    // 👇 Build decade boundaries if decade param exists
    let decadeMin = null;
    let decadeMax = null;

    if (decade) {
      const base = parseInt(decade);
      if (!isNaN(base)) {
        decadeMin = base;
        decadeMax = base + 9;
      }
    }

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

          // 🎵 Price filters
          minPrice ? { price: { gte: parseInt(minPrice) } } : {},
          maxPrice ? { price: { lte: parseInt(maxPrice) } } : {},

          // 🌟 Featured + On Sale filters
          featured !== undefined ? { featured: featured === "true" } : {},
          onSale !== undefined ? { onSale: onSale === "true" } : {},

          // 🎵 Specific release year
          releaseYear ? { releaseYear: parseInt(releaseYear) } : {},

          // 🎵 Direct year range filters
          minYear ? { releaseYear: { gte: parseInt(minYear) } } : {},
          maxYear ? { releaseYear: { lte: parseInt(maxYear) } } : {},

          // 📀 Decade filter (1960 → 1960–1969)
          decadeMin ? { releaseYear: { gte: decadeMin } } : {},
          decadeMax ? { releaseYear: { lte: decadeMax } } : {},
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
