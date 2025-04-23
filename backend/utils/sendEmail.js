// utils/sendEmail.js
require('dotenv').config();  // Ensure environment variables are loaded
const nodemailer = require('nodemailer');

// Log email credentials to verify they're loaded (Remove these logs for production!)
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // 'false' string converts to false
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"BookTable" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email send error:", error);
        throw error;
    }
};

module.exports = sendEmail;
