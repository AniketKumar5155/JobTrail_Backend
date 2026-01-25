const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP verification failed:", error.message);
    } else {
        console.log("✅ SMTP server is ready to send emails");
    }
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("EMAIL_USER or EMAIL_PASS is missing in environment variables");
        }

        if (!to) {
            throw new Error("Recipient email (to) is required");
        }

        const mailOptions = {
            from: `"JobTrail" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);
        return info;

    } catch (error) {
        console.error("Failed to send email:", {
            message: error.message,
            code: error.code,
            response: error.response,
        });

        throw error;
    }
};

module.exports = sendEmail;
