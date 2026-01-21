import { Router } from 'express';
import { createBooking, getAllBookings } from '../controllers/bookings.controller.js';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new medical booking
 */
router.post('/', createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Retrieve all bookings
 */
router.get('/', getAllBookings);

// This default export allows 'import bookingRoutes from ...' to work in app.js
export default router;