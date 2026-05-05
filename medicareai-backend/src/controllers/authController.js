// src/controllers/authController.js

export const signup = async (req, res) => {
  // Destructure the new fields from the request body
  const { email, password, name, role, specialization, license_number, city } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Unified Insert: Save all categorization data directly to the 'users' table
    // This solves the "relation specialists does not exist" error
    const userResult = await pool.query(
      `INSERT INTO users (
        email, password, role, name, specialty, registration_number, city, verification_token, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        email, 
        hashedPassword, 
        role.toLowerCase(), 
        name, 
        specialization, // This becomes the 'specialty' column
        license_number, // This becomes the 'registration_number' column
        city, 
        verificationToken, 
        false
      ]
    );

    const userId = userResult.rows[0].id;

    // Optional: Keep separate tables for relational data if needed, 
    // but the 'users' table is now the primary source for the directory.
    if (role.toLowerCase() === 'doctor') {
      await pool.query(
        "INSERT INTO doctors (user_id, name, specialization, license_number, city, is_active) VALUES ($1, $2, $3, $4, $5, true)",
        [userId, name, specialization, license_number, city]
      );
    } else {
      await pool.query("INSERT INTO patients (user_id, name) VALUES ($1, $2)", [userId, name]);
    }

    // Send Verification Email (Logic remains the same)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
       /* ... mail config ... */
    });

    res.status(201).json({ message: "Signup successful! Check your email to verify your account." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Registration failed on server" });
  }
};