// routes/contact.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./auth.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const prisma = new PrismaClient();

// =======================
// Send contact message
// =======================
router.post("/", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message)
    return res.status(400).json({ error: "Message cannot be empty" });

  try {
    // Get user's email from DB using req.userId
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Email goes to you/your support inbox
    await sendEmail({
      to: "andyhjulberg@gmail.com",     // your support email
      subject: `Support message from ${user.email}`,
      html: `
        <div style="font-family: Arial; padding: 16px;">
          <h2>New Contact Form Message</h2>
          <p><strong>From:</strong> ${user.email}</p>
          <p><strong>User ID:</strong> ${user.id}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
    });

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
