// backend/routes/telehealth.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to generate an on-demand Daily.co room URL
router.post('/create-room', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    // Set the room to automatically self-destruct in 1 hour (3600 seconds)
    const expirationTimestamp = Math.floor(Date.now() / 1000) + 3600;

    // Send request to Daily's REST API
    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        name: `medicareai-${appointmentId}`, 
        privacy: 'public', // Change to 'private' later if using dynamic meeting tokens
        properties: {
          exp: expirationTimestamp,
          enable_mesh_sfu: true,
          enable_prejoin_ui: true, // Forces a camera/mic testing screen before entry
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    // Return the secure iframe URL back to your frontend
    return res.json({ url: response.data.url });
    
  } catch (error) {
    console.error('Daily.co API Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to initialize video consult room' });
  }
});

module.exports = router;