import express from 'express';

// Import your individual feature route files below
// (Adjust these file names to match what you have in your project)
import userRoutes from './userRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';

const router = express.Router();

// Mount individual route modules
router.use('/user', userRoutes);
router.use('/appointments', appointmentRoutes);

// You can easily add more routes here in the future as your app grows:
// router.use('/medical-records', medicalRecordsRoutes);
// router.use('/telehealth', telehealthRoutes);

export default router;
