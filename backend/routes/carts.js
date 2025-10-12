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
    const cartItem = await prisma.cartItem.create({
      data: { userId: decoded.userId, listingId },
    });
    res.json(cartItem);
  } catch (err) {
    console.error(err);
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

export default router;
