const { Resend } = require("resend");

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error("RESEND_API_KEY is missing");
        }

        if (!to) {
            throw new Error("Recipient email (to) is required");
        }

        const resend = new Resend(apiKey);

        const response = await resend.emails.send({
            from: "JobTrail <onboarding@resend.dev>",
            to,
            subject,
            text,
            html,
        });

        console.log("📧 Email sent via Resend:", response.id);
        return response;

    } catch (error) {
        console.error("❌ Failed to send email via Resend:", {
            message: error.message,
            statusCode: error.statusCode,
        });

        throw error;
    }
};

module.exports = sendEmail;
