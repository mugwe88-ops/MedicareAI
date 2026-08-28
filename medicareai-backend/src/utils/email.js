import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(toEmail, recipientName, verificationToken) {
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "MedicareAI <onboarding@resend.dev>",
      to: toEmail,
      subject: "Verify Your Email Address - MedicareAI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb;">Welcome to MedicareAI, ${recipientName}!</h2>
          <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #718096; font-size: 14px;">If you did not request this, please ignore this email.</p>
          <p style="color: #718096; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });
    console.log(`📧 Verification email successfully sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
    throw new Error("Failed to send verification email.");
  }
}