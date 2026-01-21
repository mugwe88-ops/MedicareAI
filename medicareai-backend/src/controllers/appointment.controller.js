import * as appointmentService from "../services/appointment.service.js";

/**
 * Controller to fetch all appointments for a doctor
 */
export const getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for this doctor" });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error);
    return res.status(500).json({ error: "Internal Server Error while fetching appointments" });
  }
};

/**
 * Controller to create a new appointment
 */
export const handleCreateAppointment = async (req, res) => {
  try {
    const newAppointment = await appointmentService.createAppointment(req.body);
    return res.status(201).json(newAppointment);
  } catch (error) {
    return res.status(400).json({ error: "Failed to create appointment", details: error.message });
  }
};