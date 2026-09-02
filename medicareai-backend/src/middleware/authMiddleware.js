import { adminAuth } from '../config/firebaseAdmin.js';

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