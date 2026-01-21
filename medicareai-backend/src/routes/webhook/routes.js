import express from "express";

const router = express.Router();

// This handles: GET https://medicareai-1.onrender.com/api/webhook
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "medicare_secret_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

export default router;