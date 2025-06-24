import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://ai-powered-code-reviewer-xi.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("At your service my lord 🐱‍👤");
});

app.use("/ai", aiRoutes);

app.listen(port, () => {
  console.log(`i am alive ${port}`);
});
