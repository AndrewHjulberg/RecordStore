import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Get current user's cart
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: decoded.userId },
      include: { listing: true },
    });
    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
});

// Add item to cart
router.post("/", async (req, res) => {
  const { listingId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Only include salePrice if the column exists in your schema
    const cartItemData = { userId: decoded.userId, listingId };
    if (listing.salePrice !== undefined) cartItemData.salePrice = listing.salePrice;

    const cartItem = await prisma.cartItem.create({
      data: cartItemData,
    });

    res.json(cartItem);
  } catch (err) {
    console.error("Cart add error:", err);
    res.status(500).json({ error: "Could not add to cart" });
  }
});




// Remove item from cart
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const cartItemId = parseInt(req.params.id);

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== decoded.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not remove cart item" });
  }
});

// backend/routes/carts.js
router.post("/migrate", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId; // Make sure this matches your JWT payload
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }

  const { items } = req.body; // [{ listingId }]
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "No items to migrate" });

  try {
    const migratedItems = [];

    for (const item of items) {
      // Check if the listing already exists in the user's cart
      const exists = await prisma.cartItem.findFirst({
        where: {
          userId,
          listingId: item.listingId,
        },
        include: { listing: true },
      });

      if (exists) {
        migratedItems.push(exists); // already in cart, include it in response
      } else {
        const newItem = await prisma.cartItem.create({
          data: {
            userId,
            listingId: item.listingId,
          },
          include: { listing: true },
        });
        migratedItems.push(newItem);
      }
    }

    res.json(migratedItems); // Return full cart items including any duplicates avoided
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to migrate guest cart" });
  }
});


export default router;
