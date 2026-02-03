import { Router } from 'express';
// Mandatory .js extension for ESM
import { getDoctorAppointments, handleCreateAppointment } from '../controllers/appointment.controller.js';

const router = Router();

// GET /api/appointments/doctor/:doctorId
router.get('/doctor/:doctorId', getDoctorAppointments);

// POST /api/appointments
router.post('/', handleCreateAppointment);

export default router;