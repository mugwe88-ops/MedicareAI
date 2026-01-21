import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // This log is your best friend right now
  console.log("--- Webhook Attempt ---");
  console.log("Mode:", mode);
  console.log("Token Received:", token);
  console.log("Token Expected:", process.env.VERIFY_TOKEN || "medicare_secret_2026");

  if (mode === "subscribe" && token === (process.env.VERIFY_TOKEN || "medicare_secret_2026")) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  }

  console.log("❌ Verification failed");
  res.sendStatus(403);
});

export default router;