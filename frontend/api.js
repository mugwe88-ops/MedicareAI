const API_URL = "http://localhost:5000/api"; 
// later you will change to Render URL

export async function getAppointments() {
  const res = await fetch(`${API_URL}/appointments`);
  return res.json();
}
