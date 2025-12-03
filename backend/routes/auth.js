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

router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body;
  

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false, // default to false
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

// routes/auth.js
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin }, // ✅ include isAdmin
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Try to find user by email
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // No existing account → create new one
      user = await prisma.user.create({
        data: {
          email,
          password: "", // or null if schema allows
          isAdmin: false,
          name,
          picture,
          googleId: sub,
        },
      });
    } else {
      // Existing account → update googleId if missing
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId: sub },
        });
      }
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;
