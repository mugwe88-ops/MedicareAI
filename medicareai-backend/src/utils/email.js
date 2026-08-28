import nodemailer from "nodemailer";

// Configure your transport (using Gmail, SMTP, or a service like Mailtrap for dev)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(toEmail, recipientName, verificationToken) {
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"MedicareAI Support" <${process.env.SMTP_USER}>`,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email successfully sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
    throw new Error("Failed to send verification email.");
  }
}