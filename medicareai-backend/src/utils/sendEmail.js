import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: `"MedicareAI Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your MedicareAI Account',
      html: `<p>Please verify your account by clicking the link below:</p>
             <a href="${url}">${url}</a>`,
    });
    console.log(`✅ Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
  }
};