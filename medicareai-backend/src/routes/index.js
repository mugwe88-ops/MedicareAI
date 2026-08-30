import express from 'express';

import userRoutes from './user.js';
import appointmentRoutes from './bookings.routes.js'; // Adjust if you use a different file for appointments

const router = express.Router();

// Mount individual route modules
router.use('/user', userRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
