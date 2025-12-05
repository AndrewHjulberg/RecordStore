// routes/auth.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// =======================
// Signup
// =======================
router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Account already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin, googleId: user.googleId },
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
      { userId: user.id, email: user.email, isAdmin: user.isAdmin, googleId: user.googleId },
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

// Change Password route
router.patch("/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both current and new password required" });

  try {
    // Get current user
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: "Current password is incorrect" });

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all orders for the user
    const orders = await prisma.order.findMany({ where: { userId } });
    const orderIds = orders.map(order => order.id);

    // Delete all order items for those orders
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
    }

    // Delete orders
    await prisma.order.deleteMany({ where: { userId } });

    // Delete cart items
    await prisma.cartItem.deleteMany({ where: { userId } });

    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ message: "Account and all associated data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.post("/google-login", async (req, res) => {
  const { credential, useGoogle } = req.body; //  add flag from frontend

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new Google account
      user = await prisma.user.create({
        data: {
          email,
          password: null,
          isAdmin: false,
          googleId: sub,
        },
      });
    } else if (user.password && !user.googleId) {
      // User has a password account but no Google link yet
      if (useGoogle) {
        //  User chose to switch to Google login
        user = await prisma.user.update({
          where: { email },
          data: { googleId: sub, password: null }, // null out password
        });
      } else {
        //  User declined Google login
        return res.status(400).json({
          error: "Account exists with this email.",
          errorCode: "ACCOUNT_EXISTS", //  structured code
        });
      }
    } else if (!user.googleId) {
      // Link Google ID to existing account (already passwordless)
      user = await prisma.user.update({
        where: { email },
        data: { googleId: sub },
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        googleId: user.googleId,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;
