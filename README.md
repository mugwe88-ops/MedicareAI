# 🏥 Swift MD (formerly MedicareAI)

**Swift MD** is a streamlined healthcare platform designed to bridge the gap between patients and consultants using instant WhatsApp communication. It replaces traditional, slow booking forms with a real-time searchable directory and one-click WhatsApp integration.

## 🚀 Live Demo
**URL:** [https://medicareai-1.onrender.com](https://medicareai-1.onrender.com)

---

## ✨ Key Features

* **Verified Consultant Directory:** A real-time searchable list of doctors, filterable by name or specialty (e.g., Cardiology, Pediatrics).
* **WhatsApp OTP Authentication:** Secure user registration and login via 6-digit one-time passwords sent directly to the user's WhatsApp.
* **Instant WhatsApp Booking:** Patients can initiate a consultation instantly via a pre-filled WhatsApp message link.
* **Lead Tracking & Analytics:** Backend tracking of "WhatsApp Click" events to provide doctors with performance data.
* **Automated Weekly Reports:** A scheduled cron job that sends doctors a summary of their weekly leads via WhatsApp every Sunday.
* **Legal Compliance:** Built-in Terms of Service and Privacy Policy consent flow during signup.

---

## 🛠️ Technical Stack

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Backend:** Node.js, Express.js.
* **Database:** PostgreSQL (hosted on Render/Supabase).
* **API Integration:** WhatsApp Business API (Meta).
* **Session Management:** `express-session` for secure OTP verification flows.

---

## 📂 Project Structure

```text
MedicareAI/
└── medicareai-backend/
    └── src/
        ├── package.json         # Project dependencies
        ├── server.js            # Main entry point & WhatsApp logic
        ├── db.js                # Database connection configuration
        ├── public/              # Frontend assets (HTML, CSS, JS)
        └── routes/
            ├── auth.js          # OTP & Session management
            └── directory.js     # Search, Filters & Analytics tracking