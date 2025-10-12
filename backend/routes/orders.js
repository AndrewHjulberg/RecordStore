import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Checkout: create order from cart
router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get all cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: decoded.userId },
      include: { listing: true },
    });

    if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + item.listing.price, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        totalPrice,
        items: {
          create: cartItems.map((item) => ({
            listingId: item.listingId,
            price: item.listing.price,
          })),
        },
      },
      include: { items: { include: { listing: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: decoded.userId } });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// Get all orders for logged-in user
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: { items: { include: { listing: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
});

// Cancel an order
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== decoded.userId)
      return res.status(403).json({ error: "Cannot cancel someone else's order" });

    await prisma.order.delete({ where: { id: orderId } });

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
});

export default router;
