import express from 'express';
import 'dotenv/config';
import webhookRoutes from './routes/webhook/routes.js'; // Fixed path
import paymentRoutes from './routes/payments.routes.js'; 
import './jobs/reconciliation.js'; 

const app = express();

// Middlewares
app.use(express.json());

// Routes
// This makes your Meta URL: https://medicare-ai.onrender.com/api/webhook
app.use('/api', webhookRoutes); 
app.use('/api/payments', paymentRoutes);

// Root health check (Useful for Render)
app.get('/', (req, res) => {
  res.send('🟢 MedicareAI API is Running');
});

const PORT = process.env.PORT || 10000;

const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`---`);
    console.log(`🟢 MedicareAI Server is Live!`);
    console.log(`🔄 Reconciliation Job: ACTIVE`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Webhook URL: /api/webhook`);
    console.log(`---`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} busy. Exiting...`);
      process.exit(1);
    }
  });
};

startServer();