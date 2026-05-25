import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/chat", chatRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`ThinkFirst API running on http://localhost:${PORT}`);
});
