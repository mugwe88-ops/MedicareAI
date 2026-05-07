// backend/utils/jwt.js
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "medicare_secret_key"; // Match login fallback
const JWT_ISSUER = "medicareai";
const JWT_AUDIENCE = "medicareai-users";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id, // Subject is the ID
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: randomUUID(),
    }
  );
}

export function verifyToken(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // FIX: Map 'sub' back to 'id' so auth.js can find it
    req.user = {
      id: decoded.sub, 
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT VERIFICATION FAILED:", err.message);
    return res.status(401).json({ error: "Session expired, please login again" });
  }
}