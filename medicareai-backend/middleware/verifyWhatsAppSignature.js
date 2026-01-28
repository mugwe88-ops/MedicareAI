import crypto from 'crypto';

export function verifyWhatsAppSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
      .update(req.body)
      .digest('hex');

  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );

  if (!valid) {
    return res.status(401).send('Invalid signature');
  }

  // Convert raw buffer → JSON so your existing code keeps working
  req.body = JSON.parse(req.body.toString('utf8'));
  next();
}
