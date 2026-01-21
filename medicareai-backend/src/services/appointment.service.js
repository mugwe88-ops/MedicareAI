import { prisma } from "../lib/prisma.js";

/**
 * Fetch all appointments for a specific doctor
 */
export const getDoctorAppointments = async (doctorId) => {
  return await prisma.appointment.findMany({
    where: { doctorId: doctorId },
    include: {
      patient: true, // Assuming you have a patient relation
    },
    orderBy: {
      appointmentDate: 'asc'
    }
  });
};

/**
 * Create a new appointment
 */
export const createAppointment = async (data) => {
  return await prisma.appointment.create({
    data: {
      ...data,
      status: "PENDING"
    }
  });
};