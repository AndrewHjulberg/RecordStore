import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

// Create new order
router.post("/", async (req, res) => {
  const { listingId } = req.body;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId;

    // Ensure listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        userId,
      },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create order", details: err.message });
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
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Always return an array
    res.json(Array.isArray(orders) ? orders : []);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token", details: err.message });
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
    res.status(403).json({ error: "Invalid token", details: err.message });
  }
});

export default router;
