import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import rateLimit from "express-rate-limit";

import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://ai-powered-code-reviewer-xi.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  })
);

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a minute before trying again.",
  },
});

app.use("/ai", limiter);

// ─── BODY PARSER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "CodePulse API",
    version: "2.0.0",
  });
});

app.use("/ai", aiRoutes);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error." });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`CodePulse API running on port ${port}`);
});
