import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://crypkey.vercel.app",
        "http://localhost:3000",
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ Blocked CORS request from:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ai", aiRoutes);
app.listen(process.env.PORT || 5000, () => {
  console.log(`CrypKey backend running on port ${process.env.PORT || 5000}`);
});
