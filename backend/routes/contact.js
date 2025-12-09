import express from "express";
import jwt from "jsonwebtoken";
import { sendContactEmail } from "../utils/email.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;
    const { message } = req.body;

    await sendContactEmail({
      name: decoded.email, // or you can include decoded.fullName if available
      email: userEmail,
      message,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
