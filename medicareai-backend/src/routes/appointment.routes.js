import { Router } from 'express';
// Ensure you are importing from the CONTROLLER, not the service
import { getDoctorAppointments, handleCreateAppointment } from '../controllers/appointment.controller.js';

const router = Router();

// GET /api/appointments/doctor/:doctorId
router.get('/doctor/:doctorId', getDoctorAppointments);

// POST /api/appointments
router.post('/', handleCreateAppointment);

export default router;