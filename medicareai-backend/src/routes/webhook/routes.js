import express from "express";
import axios from "axios";
import pool from "../../db.js"; // Import our new database connection

const router = express.Router();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "medicare_secret_2026";

/** 1. Handshake (GET) **/
router.get("/", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

/** 2. Incoming Messages (POST) **/
router.post("/", async (req, res) => {
  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const metadata = value?.metadata; // Contains Phone ID
    const message = value?.messages?.[0];

    if (message && metadata) {
      const phoneId = metadata.phone_number_id;

      // LOOKUP: Find the specific consultant in Postgres
      const result = await pool.query(
        'SELECT * FROM consultants WHERE whatsapp_phone_id = $1', 
        [phoneId]
      );
      const consultant = result.rows[0];

      if (!consultant) {
        console.error(`Unknown consultant: ${phoneId}`);
        return res.sendStatus(200);
      }

      const patientNumber = message.from;

      // If patient clicked "Book Appointment"
      if (message.type === "interactive" && message.interactive?.button_reply?.id === "book_now") {
        await sendTextMessage(phoneId, consultant.whatsapp_access_token, patientNumber, 
          `Great! You can book with ${consultant.name} here: ${consultant.booking_url}`);
      } 
      // If patient sent a regular text
      else if (message.type === "text") {
        await sendBookingButton(phoneId, consultant.whatsapp_access_token, patientNumber, consultant.name);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } catch (err) {
    console.error("Webhook Error:", err);
    res.sendStatus(500);
  }
});

// Helpers (sendBookingButton & sendTextMessage) remain the same as previous step...