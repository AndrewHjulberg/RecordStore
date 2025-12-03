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

// GET all orders for logged-in user
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        items: {
          include: { listing: true } // include listing details in each order item
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(Array.isArray(orders) ? orders : []);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token", details: err.message });
  }
});



router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // ✅ extract token
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // ✅ or decoded.userId depending on how you sign the token

    const orderId = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this order" });
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({ where: { orderId } });
    // Then delete the order
    await prisma.order.delete({ where: { id: orderId } });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Success page routing
// GET /orders/session/:sessionId
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
      include: { items: { include: { listing: true } } },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error fetching order by session:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});



export default router;
