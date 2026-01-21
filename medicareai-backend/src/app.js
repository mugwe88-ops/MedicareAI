import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Import Routes (Mandatory .js extensions for ESM)
import paymentRoutes from './routes/payments.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import bookingRoutes from './routes/bookings.routes.js';

const app = express();

// ---- MIDDLEWARE ----
// Allow requests from your frontend (React/Mobile)
app.use(cors()); 

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded bodies (useful for some callback formats)
app.use(express.urlencoded({ extended: true }));

// ---- HEALTH CHECK ----
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MedicareAI Backend is running' });
});

// ---- ROUTES ----
// Connect your feature modules to specific URL paths
app.use('/api/payments', paymentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/bookings', bookingRoutes);

// ---- ERROR HANDLING ----
// Catch-all for 404 - Route Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

export default app;