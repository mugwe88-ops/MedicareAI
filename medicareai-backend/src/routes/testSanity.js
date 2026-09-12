import express from 'express';
import { createClient } from '@sanity/client';

const router = express.Router();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATABASE || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

router.get('/test-sanity', async (req, res) => {
  try {
    const count = await client.fetch(`count(*[_type == "post" || defined(_type)])`);
    res.json({ success: true, message: 'Connected to Sanity!', documentCount: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;