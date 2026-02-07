// src/utils/jwt.js
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

/* ===================== CONFIG ===================== */

const {
  JWT_SECRET,
  JWT_ISSUER = "medicareai",
  JWT_AUDIENCE = "medicareai-users",
  ACCESS_TOKEN_TTL = "15m",
  REFRESH_TOKEN_TTL = "30d",
} = process.env;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

/* ===================== TOKEN GENERATORS ===================== */

// Access Token (short-lived)
export function signAccessToken(user) {
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
      algorithm: "HS256",
    }
  );
}

// Refresh Token (long-lived)
export function signRefreshToken(user) {
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
      algorithm: "HS256",
    }
  );
}

/* ===================== TOKEN VERIFIER ===================== */

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/* ===================== EXPRESS AUTH MIDDLEWARE ===================== */

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    // Prevent refresh token abuse
    if (payload.type !== "access") {
      return res.status(401).json({ error: "Refresh token cannot access API" });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* ===================== ROLE MIDDLEWARE ===================== */

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
