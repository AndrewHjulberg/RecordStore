import express from "express";
import jwt from "jsonwebtoken"; // make sure this is imported
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // match your auth.js secret

// ✅ Middleware to check admin
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: "Not authorized" });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ✅ POST route to add a listing
router.post("/listings", requireAdmin, async (req, res) => {
  console.log("Creating new listing:", req.body); // <-- add this for debugging
  try {
    const listing = await prisma.listing.create({
      data: req.body,
    });
    res.json(listing);
  } catch (err) {
    console.error("Error creating listing:", err); // <-- log the real error
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

export default router;
