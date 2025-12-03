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

export const sendAccountCreatedEmail = async (toEmail, username) => {
  try {
    const msg = {
      to: toEmail,
      from: process.env.EMAIL_FROM, // your domain email
      subject: "Welcome to VinylVerse!",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Welcome, ${username}!</h2>
          <p>Your account has been created successfully.</p>
          <p>You can now log in and start browsing records anytime.</p>
          <br/>
          <p>— VinylVerse Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("Account creation email sent");
  } catch (err) {
    console.error("SendGrid Error:", err);
  }
};
