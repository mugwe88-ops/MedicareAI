import express from 'express';
import 'dotenv/config';
// The import below is updated to match your actual folder: src/routes/webhook/routes.js
import webhookRoutes from './routes/webhook/routes.js'; 
import paymentRoutes from './routes/payments.routes.js'; 
import './jobs/reconciliation.js'; 

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// 1. Health Check for Render (Prevents "No open ports detected" error)
app.get('/', (req, res) => {
  res.status(200).send('MedicareAI API is Live');
});

// 2. Routes
// This sets your endpoint to: https://medicare-ai.onrender.com/api/webhook
app.use('/api', webhookRoutes); 
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 10000;

// 3. Start Server with 0.0.0.0 binding for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`---`);
  console.log(`🟢 MedicareAI Server is Live!`);
  console.log(`🔄 Reconciliation Job: ACTIVE`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Webhook Path: /api/webhook`);
  console.log(`---`);
});