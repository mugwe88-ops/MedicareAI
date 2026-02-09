import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

/* ================= CONFIG ================= */
const {
  JWT_SECRET,
  JWT_ISSUER = "medicareai",
  JWT_AUDIENCE = "medicareai-users",
  ACCESS_TOKEN_TTL = "15m",
  REFRESH_TOKEN_TTL = "30d"
} = process.env;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

/* ============ ACCESS TOKEN ============ */
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access"
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: randomUUID()
    }
  );
}

/* ============ REFRESH TOKEN ============ */
export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_TTL,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: randomUUID()
    }
  );
}

/* ============ VERIFY TOKEN MIDDLEWARE ============ */
export function verifyToken(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
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
