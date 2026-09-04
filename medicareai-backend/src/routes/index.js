import express from 'express';
import userRoutes from './user.js';
import appointmentRoutes from './bookings.routes.js';
import specialtyRoutes from './specialty.js';
import doctorRoutes from './doctors.routes.js';

const router = express.Router();

// Mount individual route modules
router.use('/user', userRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/doctors', doctorRoutes);

export default router;