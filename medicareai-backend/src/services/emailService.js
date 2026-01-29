import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: '"Swift MD Support" <mugwe88@gmail.com>',
        to: email,
        subject: 'Swift MD: Your Verification Code',
        text: `Your verification code is: ${otp}. Please enter this to complete your registration.`,
        html: `<b>Your Swift MD verification code is: ${otp}</b>`
    };

    return transporter.sendMail(mailOptions);
};
