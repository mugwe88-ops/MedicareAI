import * as appointmentService from "../services/appointment.service.js";

/**
 * Controller to fetch all appointments for the AUTHENTICATED doctor.
 * Uses req.user.id from the auth middleware to prevent data mix-ups.
 */
export const getDoctorAppointments = async (req, res) => {
  try {
    // SECURITY: Use the ID from the decoded JWT token, not req.params
    const doctorId = req.user.id; 

    if (!doctorId) {
      return res.status(401).json({ error: "Unauthorized: No doctor ID found in token" });
    }

    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    
    // Always return an array to keep the frontend logic consistent
    return res.status(200).json(appointments || []);
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Controller to create a new appointment
 */
export const handleCreateAppointment = async (req, res) => {
  const appointmentData = req.body;

  if (!appointmentData || Object.keys(appointmentData).length === 0) {
    return res.status(400).json({ error: "Request body is missing" });
  }

  try {
    const newAppointment = await appointmentService.createAppointment(appointmentData);
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error in handleCreateAppointment:", error);
    return res.status(400).json({ 
      error: "Failed to create appointment", 
      details: error.message 
    });
  }
};

/**
 * Controller to update appointment status (e.g., Completed/Cancelled)
 */
export const handleUpdateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await appointmentService.updateAppointmentStatus(id, status);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: "Update failed", details: error.message });
  }
};