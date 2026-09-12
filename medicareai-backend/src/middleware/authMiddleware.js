import { adminAuth } from '../config/firebaseAdmin.js';
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains user ID and role
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export async function verifyDoctorRole(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Forbidden: Doctor access required' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}