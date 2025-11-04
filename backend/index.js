import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import listingsRoutes from "./routes/listings.js";
import adminRoutes from "./routes/admin.js";
import ordersRoutes from "./routes/orders.js";
import cartsRoutes from "./routes/carts.js";
import checkoutRoutes, { stripeWebhook } from "./routes/checkout.js";

dotenv.config();
const app = express();

// ✅ CORS
app.use(cors());

// ✅ Stripe webhook: must be before express.json()
app.post("/checkout/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// ✅ Regular JSON parser for everything else
app.use(express.json());

// ✅ Mount all routers
app.use("/checkout", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/listings", listingsRoutes);
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/carts", cartsRoutes);

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ✅ Server start
app.listen(process.env.PORT || 5000, () =>
  console.log(`Backend running on port ${process.env.PORT || 5000}`)
);
