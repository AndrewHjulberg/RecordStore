import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import listingsRoutes from "./routes/listings.js";
import adminRoutes from "./routes/admin.js";
import ordersRoutes from "./routes/orders.js";
import cartsRoutes from "./routes/carts.js";
import checkoutRoutes from "./routes/checkout.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/admin", adminRoutes);

app.use("/listings", listingsRoutes);
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/carts", cartsRoutes);
app.use("/checkout", checkoutRoutes);


// test route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Backend running on port ${process.env.PORT || 5000}`)
);
