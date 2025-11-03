import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const { fullName, address, city, state, zip } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { listing: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.listing.price,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        status: "pending",
        shippingAddress: `${fullName}, ${address}, ${city}, ${state} ${zip}`,
        items: {
          create: cartItems.map((item) => ({
            listingId: item.listingId,
            price: item.listing.price
          })),
        },
      },
      include: { items: { include: { listing: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.json({ message: "Checkout successful", order });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
});

export default router;
