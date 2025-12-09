import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- Generic send function ---
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

// --- Account creation email ---
export const sendAccountCreatedEmail = async (to) => {
  const html = `
    <h1>Welcome to Vinylverse!</h1>
    <p>Your account has been successfully created.</p>
    <p>Start browsing our amazing vinyl collection now.</p>
  `;
  await sendEmail({ to, subject: "Account Created", html });
};

// --- Order confirmation email ---
export const sendOrderConfirmationEmail = async (to, order) => {
  const html = `
    <h1>Order Confirmation - #${order.id}</h1>
    <p>Thank you for your purchase! Here are your order details:</p>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.listing.title} - $${item.price.toFixed(2)}</li>`
        )
        .join("")}
    </ul>
    <p>Total: $${order.totalPrice.toFixed(2)}</p>
    <p>Shipping: ${order.shippingAddress}</p>
  `;
  await sendEmail({ to, subject: "Order Confirmation", html });
};

// --- Contact form email ---
export const sendContactEmail = async ({ name, email, message }) => {
  const html = `
    <h1>New Contact Form Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;
  await sendEmail({ to: process.env.EMAIL_FROM, subject: "Contact Form", html });
};
