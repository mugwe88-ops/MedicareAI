import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
  // Strip trailing slashes to guarantee clean URL construction
  const rawUrl = process.env.FRONTEND_URL || 'https://medicare-ai-two.vercel.app';
  const frontendUrl = rawUrl.replace(/\/+$/, '');
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Missing RESEND_API_KEY environment variable.');
    return { success: false, error: 'Missing API Key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'SwiftMD Support <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your SwiftMD Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SwiftMD</h2>
          <p>Please click the button below to verify your email address and activate your account:</p>
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 16px 0;">
            Verify Email Address
          </a>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Returned Error:', error);
      return { success: false, error };
    }

    console.log('✅ Verification email sent via Resend:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Unexpected Error Sending Verification Email:', err);
    return { success: false, error: err.message };
  }
};