import nodemailer from "nodemailer";
import crypto from "crypto";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- UPDATED SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization, city } = req.body;
  const phone = req.body.phone || req.body.phone_number;
  const licenseNumber = req.body.licenseNumber || req.body.license_number;

  if (!email || !password || !phone) {
    return res.status(400).json({ error: "Email, password, and phone number are required." });
  }

  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a secure random verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const resolvedName = name && name.trim() !== "" ? name : email.split('@')[0];
    const resolvedRole = role ? role.toLowerCase() : "patient";
    const resolvedSpecialization = resolvedRole === "doctor" && specialization ? specialization : null;
    const resolvedLicense = resolvedRole === "doctor" && licenseNumber && licenseNumber.trim() !== "" ? licenseNumber : null;
    const resolvedCity = city && city.trim() !== "" ? city : null;
    const resolvedPhone = phone && phone.trim() !== "" ? phone : null;

    // Insert user with is_verified = false
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone, is_verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9)
       RETURNING id, name, email, role, phone`,
      [resolvedName, email, hashedPassword, resolvedRole, resolvedSpecialization, resolvedLicense, resolvedCity, resolvedPhone, verificationToken]
    );

    // Send Verification Email
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: '"SwiftMD Support" <no-reply@swiftmd.com>',
      to: email,
      subject: "Verify Your SwiftMD Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to SwiftMD, ${resolvedName}!</h2>
          <p>Please click the button below to verify your email address and activate your account:</p>
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email</a>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(201).json({
      message: "Registration successful! Please check your email to verify your account before logging in.",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
});

// --- NEW VERIFICATION ROUTE ---
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Verification token is missing." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE verification_token = $1", [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    await pool.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1",
      [token]
    );

    return res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Server error during verification." });
  }
});

// --- UPDATED LOGIN ROUTE (Blocks unverified users) ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const userRow = result.rows[0];

    // BLOCK LOGIN IF NOT VERIFIED
    if (!userRow.is_verified) {
      return res.status(403).json({ error: "Please verify your email address before logging in. Check your inbox for the verification link." });
    }

    const isMatch = await bcrypt.compare(password, userRow.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: userRow.id, role: userRow.role || "patient" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h", audience: "medicareai-users" }
    );

    return res.json({
      token,
      user: {
        id: userRow.id,
        name: userRow.name || userRow.email.split('@')[0],
        email: userRow.email,
        role: userRow.role || "patient",
        phone: userRow.phone || null
      }
    });
  } catch (err) {
    console.error("Server login error:", err);
    return res.status(500).json({ error: "Server login error" });
  }
});