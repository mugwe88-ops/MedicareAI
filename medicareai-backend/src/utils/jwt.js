// src/utils/jwt.js
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

/* ================= CONFIG ================= */
const JWT_SECRET = process.env.JWT_SECRET || null;
const JWT_ISSUER = process.env.JWT_ISSUER || "medicareai";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "medicareai-users";
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "30d";

/* ================= SAFETY MODE ================= */
// If JWT_SECRET is missing, disable JWT instead of crashing
const JWT_ENABLED = !!JWT_SECRET;

if (!JWT_ENABLED) {
  console.warn("⚠️ JWT is DISABLED (no JWT_SECRET found). Auth will be bypassed.");
}

/* ============ ACCESS TOKEN ============ */
export function signAccessToken(user) {
  if (!JWT_ENABLED) return null;

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: randomUUID(),
    }
  );
}

/* ============ REFRESH TOKEN ============ */
export function signRefreshToken(user) {
  if (!JWT_ENABLED) return null;

  return jwt.sign(
    {
      sub: user.id,
      type: "refresh",
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_TTL,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: randomUUID(),
    }
  );
}

/* ============ VERIFY TOKEN MIDDLEWARE ============ */
export function verifyToken(req, res, next) {
  if (!JWT_ENABLED) {
    // Bypass auth in dev / Render if secret missing
    req.user = { id: "dev-user", role: "admin" };
    return next();
  }

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

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
