// routes/auth.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// =======================
// Signup
// =======================
router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// =======================
// Login
// =======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// =======================
// Auth middleware
// =======================
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // save userId for routes
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// =======================
// Change Email
// =======================
router.patch("/email", authMiddleware, async (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail) return res.status(400).json({ error: "Email is required" });

  try {
    // Check if email already exists
    const exists = await prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    // Update email
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { email: newEmail },
    });

    // Return updated token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Email updated", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update email" });
  }
});

export default router;
