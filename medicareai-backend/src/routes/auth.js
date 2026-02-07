// src/middleware/auth.js
import jwt from "jsonwebtoken";
import db from "../utils/db-setup.js"; // optional (remove if not using DB sessions)

const {
  JWT_SECRET,
  JWT_ISSUER = "medicareai",
  JWT_AUDIENCE = "medicareai-users"
} = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

/**
 * Verify JWT safely
 */
export function verifyToken(token, options = {}) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    ...options,
  });
}

/**
 * Express middleware: Require Auth
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify cryptographic signature + claims
    const payload = verifyToken(token);

    // ✅ Enforce token type (prevents refresh token misuse)
    if (payload.type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    // OPTIONAL: Check token revocation / session DB
    if (payload.jti) {
      const session = await db.sessions.findUnique({
        where: { jti: payload.jti },
      });

      if (!session || session.revoked) {
        return res.status(401).json({ error: "Token revoked" });
      }
    }

    // Attach user to request
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (err) {
    console.error("JWT Auth Error:", err.message);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

/**
 * Role-based access control
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
