// routes/adminOrders.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /admin/orders/:id  (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
        user: true, // optional: lets admin see who placed it
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;