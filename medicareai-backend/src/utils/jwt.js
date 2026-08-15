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

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      console.error("AUTH ERROR: Missing or malformed Bearer token");
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract token cleanly regardless of extra spacing
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    // Verify token flexible on issuer/audience to prevent immediate 401 on legacy tokens
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Attach decoded details to request object
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT VERIFICATION FAILED:", err.message);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}