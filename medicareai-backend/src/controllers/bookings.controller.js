import { prisma } from "../lib/prisma.js";

/**
 * Creates a new booking and saves it to the database
 */
export const createBooking = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;

    // Basic validation
    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    const booking = await prisma.booking.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        reason: reason || "",
        status: "PENDING",
      },
    });

    console.log(`✅ Booking created: ${booking.id}`);
    return res.status(201).json(booking);
  } catch (error) {
    console.error("❌ createBooking Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Fetches all bookings with related doctor and patient data
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        doctor: true,
        patient: true,
      },
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ getAllBookings Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};