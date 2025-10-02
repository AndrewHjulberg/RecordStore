import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret"; // make sure this is the same everywhere

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.create({ data: { email, password } });

    // ✅ Sign a JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Signup failed" });
  }
});


// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(400).json({ error: "User not found" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token })
});

export default router;
