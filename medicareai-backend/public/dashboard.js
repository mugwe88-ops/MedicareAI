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

loadDashboard();