import express from "express";

const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "medicare_secret_2026";

/**
 * Webhook verification (Meta / WhatsApp)
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    return res.status(200).send(challenge); // MUST be plain text
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

export default router;
