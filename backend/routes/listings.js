// routes/listings.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import requireAdmin from "../middleware/requireAdmin.js";
import multer from "multer";
const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({storage});

router.get("/discogs", async (req, res) => {
  const {upc} = req.query;
  const key = process.env.DISCOGS_KEY;
  const secret = process.env.DISCOGS_SECRET;

  try{
    const url = `https://api.discogs.com/database/search?barcode=${upc}&key=${key}&secret=${secret}`;
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err){
    res.status(500).json({error: err.message});
  }
});


// ✅ POST route to add a listing (INT-friendly)
router.post("/", requireAdmin, upload.fields([{name: "photo_front"},{name: "photo_back"}]), async (req, res) => {
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
    let imageBase64_front = null;
    let imageBase64_back = null;
    let imageMime_front = null;
    let imageMime_back = null;
    if (req.files["photo_front"]) {
      const file = req.files["photo_front"][0];
      imageBase64_front = file.buffer.toString("base64");
      imageMime_front = file.mimetype;
    }
    if (req.files["photo_back"]){
      const file = req.files["photo_back"][0];
      imageBase64_back = file.buffer.toString("base64");
      imageMime_back = file.mimetype;
    }
    const listing = await prisma.listing.create({
      data: {
        title,
        artist,
        genre,
        price: parseInt(price),
        condition,
        imageUrl,
        imageBase64_front,
        imageBase64_back,
        imageMime_front,
        imageMime_back,
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
// ✅ GET /listings/:id — fetch a single listing
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// ✅ PUT /listings/:id — update a listing
router.put("/:id", requireAdmin, upload.fields([{name: "photo_front"}, {name: "photo_back"}]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

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

    let imageBase64_front = null;
    let imageBase64_back = null;
    let imageMime_front = null;
    let imageMime_back = null;

    if (req.files["photo_front"]) {
      const file = req.files["photo_front"][0];
      imageBase64_front = file.buffer.toString("base64");
      imageMime_front = file.mimetype;
    }

    if (req.files["photo_back"]) {
      const file = req.files["photo_back"][0];
      imageBase64_back = file.buffer.toString("base64");
      imageMime_back = file.mimetype;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title,
        artist,
        genre,
        price: parseInt(price),
        condition,
        imageUrl,
        featured: featured === "true",
        onSale: onSale === "true",
        salePrice: onSale ? parseInt(salePrice) : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        ...(imageBase64_front && { imageBase64_front, imageMime_front }),
        ...(imageBase64_back && { imageBase64_back, imageMime_back }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// DELETE a listing
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await prisma.listing.delete({
      where: { id },
    });

    res.json({ message: "Listing deleted", deleted });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete listing" });
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
    // Build a unified releaseYear filter to avoid collisions
  const releaseYearFilter = {};

  if (releaseYear) releaseYearFilter.equals = parseInt(releaseYear);
  if (minYear) releaseYearFilter.gte = parseInt(minYear);
  if (maxYear) releaseYearFilter.lte = parseInt(maxYear);
  if (decadeMin) releaseYearFilter.gte = decadeMin;
  if (decadeMax) releaseYearFilter.lte = decadeMax;

  const listings = await prisma.listing.findMany({
    where: {
      AND: [
        // Search filter
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { artist: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},

        // Genre filter
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},

        // Price filters
        minPrice ? { price: { gte: parseInt(minPrice) } } : {},
        maxPrice ? { price: { lte: parseInt(maxPrice) } } : {},

        // Featured / On Sale
        featured !== undefined ? { featured: featured === "true" } : {},
        onSale !== undefined ? { onSale: onSale === "true" } : {},

        // Unified release year filter
        Object.keys(releaseYearFilter).length
          ? { releaseYear: releaseYearFilter }
          : {},

        // Exclude listings already in any cart
        { cartItems: { none: {} } },

        // Exclude listings in active orders (pending or paid)
        {
          orderItems: {
            none: {
              order: {
                status: { in: ["pending", "paid"] },
              },
            },
          },
        },
      ],
    },

    // Newest first
    orderBy: { createdAt: "desc" },
  });

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// ✅ GET /listings/:id — fetch a single listing by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

export default router;
