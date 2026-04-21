import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGNUP LOGIC
export const signup = async (req, res) => {
  const { email, password, name, role, specialization, license_number, city } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into 'users' table
    const userResult = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, role",
      [email, hashedPassword, role]
    );
    const userId = userResult.rows[0].id;

    // 4. If the user is a doctor, add professional details to 'doctors' table
    if (role === 'doctor') {
      await pool.query(
        `INSERT INTO doctors (user_id, name, specialization, license_number, city, is_active) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, name, specialization, license_number, city] // license_number is required
      );
    } 
    // 5. If the user is a patient, add to 'patients' table
    else {
      await pool.query(
        "INSERT INTO patients (user_id, name) VALUES ($1, $2)",
        [userId, name]
      );
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Registration failed on server" });
  }
};

// LOGIN LOGIC
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const user = result.rows[0];

    // 2. Compare entered password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 3. Create a JWT Token
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "24h",
    });

    // 4. Return token and role for frontend redirection
    res.json({
      token,
      role: user.role,
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};