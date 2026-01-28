import crypto from 'crypto';

/**
 * Middleware to verify the X-Hub-Signature-256 header from Meta.
 * This ensures the request is authentic and sent by WhatsApp/Meta.
 */
export const verifyWhatsAppSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const appSecret = process.env.APP_SECRET; // Ensure this is in your Render Env Vars

  if (!signature) {
    console.warn('[Security] Missing X-Hub-Signature-256 header.');
    return res.sendStatus(401);
  }

  if (!appSecret) {
    console.error('[Security] APP_SECRET is not defined in environment variables.');
    return res.sendStatus(500);
  }

  try {
    // 1. Extract the hash from the header (format is sha256=hash)
    const elements = signature.split('=');
    const signatureHash = elements[1];

    // 2. Generate our own hash using the raw body and our App Secret
    const expectedHash = crypto
      .createHmac('sha256', appSecret)
      .update(req.rawBody) // This was attached in server.js middleware
      .digest('hex');

    // 3. Constant-time comparison to prevent timing attacks
    if (crypto.timingSafeEqual(Buffer.from(signatureHash), Buffer.from(expectedHash))) {
      next();
    } else {
      console.warn('[Security] Signature mismatch. Request rejected.');
      res.sendStatus(401);
    }
  } catch (err) {
    console.error('[Security] Error verifying signature:', err);
    res.sendStatus(500);
  }
};