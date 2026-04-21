const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined"
    ? "http://localhost:5000"
    : "");

/**
 * Fetches all appointments for the dashboard
 */
export async function getAppointments() {
  const res = await fetch(`${API_BASE}/api/appointments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return res.json();
}

/**
 * Searches for doctors based on specialization and city.
 * Map 'query' to 'specialization' to match the backend route:
 * const { city, specialization } = req.query;
 */
export async function searchDoctors(query: string, city: string) {
  // Changed '?search=' to '?specialization=' to match your backend logic
  const res = await fetch(`${API_BASE}/api/doctors?specialization=${query}&city=${city}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to search doctors");
  }
  
  return res.json();
}