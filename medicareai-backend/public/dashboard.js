async function loadDashboard() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) {
            window.location.href = '/login.html'; // Kick out if not logged in
            return;
        }

        const user = await response.json();
        document.getElementById('userInfo').innerText = `${user.name} (${user.role})`;
        document.getElementById('welcomeText').innerText = `Hello, ${user.name}!`;

        const content = document.getElementById('roleContent');
        
        if (user.role === 'doctor') {
            content.innerHTML = `
                <h3>Doctor Portal</h3>
                <p>View your upcoming consultations and patient messages.</p>
                <button onclick="alert('Viewing Consultations...')">View Patient List</button>
            `;
        } else {
            content.innerHTML = `
                <h3>Patient Portal</h3>
                <p>Need medical help? Book an appointment via WhatsApp or our web portal.</p>
                <button onclick="window.location.href='/book.html'">Book New Appointment</button>
            `;
        }
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

// Add this inside your loadDashboard() function after user info is set
async function fetchAppointments() {
    const response = await fetch('/api/appointments/my-appointments');
    const appointments = await response.json();
    
    const content = document.getElementById('roleContent');
    
    if (appointments.length === 0) {
        content.innerHTML += `<p style="margin-top:20px; color:gray;">You have no upcoming appointments.</p>`;
        return;
    }

    let tableHtml = `
        <h3 style="margin-top:20px;">Your Appointments</h3>
        <table style="width:100%; border-collapse: collapse; margin-top:10px;">
            <thead>
                <tr style="text-align:left; border-bottom: 2px solid #eee;">
                    <th>Date</th>
                    <th>Department</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    appointments.forEach(appt => {
        // Format date nicely
        const date = new Date(appt.appointment_date).toLocaleDateString();
        tableHtml += `
            <tr style="border-bottom: 1px solid #eee; height: 40px;">
                <td>${date} at ${appt.appointment_time}</td>
                <td>${appt.department}</td>
                <td><span class="status-badge ${appt.status}">${appt.status}</span></td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;
    content.innerHTML += tableHtml;
}

fetchAppointments();

document.getElementById('logoutBtn').addEventListener('click', async () => {
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
        // Redirect to landing page after session is destroyed
        window.location.href = '/index.html';
    } else {
        alert("Logout failed");
    }
});

loadDashboard();