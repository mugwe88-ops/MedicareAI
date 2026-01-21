import express from "express";

const router = express.Router();

// This will check your Render Env Var first, then fallback to the string
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "medicare_secret_2026";

/**
 * Webhook verification (Meta / WhatsApp)
 */
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("--- Incoming Verification Request ---");
  console.log("Token received from Meta:", token);
  console.log("Token expected by Server:", VERIFY_TOKEN);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    // MUST send the challenge back as a raw string
    return res.status(200).send(challenge); 
  }

  console.log("❌ Verification failed. Mismatch between tokens.");
  return res.sendStatus(403);
});

export default router;