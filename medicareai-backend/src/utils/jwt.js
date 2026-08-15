import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "medicare_secret_key";
const JWT_ISSUER = "medicareai";
const JWT_AUDIENCE = "medicareai-users";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
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
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    console.log("--- AUTH CHECK ---");
    console.log("Incoming Auth Header:", authHeader);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      console.error("401 REASON: Missing or malformed Bearer header");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    console.log("Extracted Token:", token.substring(0, 15) + "...");
    console.log("Using Secret Key:", JWT_SECRET ? "SECRET_PRESENT" : "NO_SECRET_DEFINED");

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("AUTH SUCCESS for User ID:", req.user.id);
    next();
  } catch (err) {
    console.error("401 REASON (jwt.verify failed):", err.message);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}