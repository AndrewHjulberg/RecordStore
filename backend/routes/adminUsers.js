import express from "express";
import { PrismaClient } from "@prisma/client";
import requireAdmin from "../middleware/requireAdmin.js";

const prisma = new PrismaClient();
const router = express.Router();

// GET /admin/users/lookup?email=... OR ?id=...
router.get("/lookup", requireAdmin, async (req, res) => {
  const { email, id } = req.query;

  if (!email && !id) {
    return res.status(400).json({ error: "Provide email or id" });
  }

  try {
    let user = null;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { orders: true },
      });
    } else if (id) {
      user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { orders: true },
      });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;