import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET; // use same secret as your auth routes

router.post("/", async (req, res) => {
  const { listingId } = req.body; // only need listingId now

  try {
    // ✅ Extract token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId; // logged-in user ID from token

    // ✅ Check that the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // ✅ Create order tied to real logged-in user
    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        userId,
        // total: listing.price, // add if schema supports
      },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Could not create order", details: err.message });
  }
});

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decoded);
    console.log("Filtering orders for userId:", decoded.userId);

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: { listing: true }, // include record details
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token", details: err.message });
  }
});

export default router;
