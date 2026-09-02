import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Load your service account JSON file
const serviceAccount = require('./path-to-your-firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();