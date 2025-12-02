import sgMail from "@sendgrid/mail";

// Load API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generic email sender
export async function sendEmail({ to, subject, html }) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("📧 Email sent to", to);
    return true;
  } catch (err) {
    console.error("SendGrid Error:", err.response?.body || err);
    return false;
  }
}
