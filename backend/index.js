import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

app.use("/auth", authRoutes);


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
