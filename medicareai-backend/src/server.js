import dotenv from "dotenv";
import express from "express";

dotenv.config();


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

/**
 * Webhook verification (Meta)
 */
app.get("/api/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  console.error("❌ Webhook verification failed");
  return res.sendStatus(403);
});

/**
 * Webhook events
 */
app.post("/api/webhook", (req, res) => {
  console.log("📩 Incoming webhook:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("🟢 MedicareAI Server is Live!");
  console.log(`📍 Port: ${PORT}`);
  console.log("🔗 Webhook Path: /api/webhook");
});
