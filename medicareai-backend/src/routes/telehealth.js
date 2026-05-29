import express from 'express';
import axios from 'axios';

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
        privacy: 'public', 
        properties: {
          exp: expirationTimestamp,
          enable_mesh_sfu: true,
          enable_prejoin_ui: true, 
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    return res.json({ url: response.data.url });
    
  } catch (error) {
    console.error('Daily.co API Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to initialize video consult room' });
  }
});

// CRITICAL FIX: This tells Node.js exactly what "telehealthRouter" is!
export default router;