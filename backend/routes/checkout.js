console.log("CHECKOUT.JS LOADING");

import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { sendEmail } from "../utils/email.js";  // ⭐ ADDED

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- Create Stripe checkout session handler ---
export const createCheckoutSession = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const { fullName, address, city, state, zip } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { listing: true },
    });

    if (cartItems.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.listing.title,
          description: item.listing.artist,
          images: [item.listing.imageUrl],
        },
        unit_amount: Math.round((item.salePrice ?? item.listing.price) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/cancel",
      metadata: { userId: String(userId), fullName, address, city, state, zip },
    });

    await prisma.cartItem.updateMany({
      where: { userId },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// --- Stripe webhook handler ---
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);

    const shipping = session.shipping || {};
    const customerDetails = session.customer_details || {};
    const fullName =
      shipping?.name ||
      customerDetails?.name ||
      session.metadata?.fullName ||
      "Unknown";
    const addressObj = shipping?.address || customerDetails?.address || {};
    const address = addressObj.line1 || session.metadata?.address || "";
    const city = addressObj.city || session.metadata?.city || "";
    const state = addressObj.state || session.metadata?.state || "";
    const zip = addressObj.postal_code || session.metadata?.zip || "";

    const cartItems = await prisma.cartItem.findMany({
      where: { stripeSessionId: session.id },
      include: { listing: true },
    });

    if (cartItems.length > 0) {
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.listing.salePrice ?? item.listing.price),
        0
      );

      const order = await prisma.order.create({
        data: {
          userId,
          totalPrice,
          status: "paid",
          stripeSessionId: session.id,
          shippingAddress: `${fullName}, ${address}, ${city}, ${state} ${zip}`,
          items: {
            create: cartItems.map((item) => ({
              listingId: item.listingId,
              price: item.salePrice ?? item.listing.price,
            })),
          },
        },
      });

      // Delete cart after order
      await prisma.cartItem.deleteMany({ where: { stripeSessionId: session.id } });

      console.log(`✅ Order created for user ${userId}`);

      // ------------------------------
      // ⭐ SEND ORDER CONFIRMATION EMAIL
      // ------------------------------

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (user?.email) {
        const itemsHtml = cartItems
          .map(
            (item) =>
              `<p><strong>${item.listing.title}</strong> — ${item.listing.artist} — $${item.listing.salePrice ?? item.listing.price}</p>`
          )
          .join("");

        await sendEmail({
          to: user.email,
          subject: "Your Order Confirmation",
          html: `
            <h1>Thank you for your order!</h1>
            <p>Your order has been successfully placed.</p>

            <h3>Order Details:</h3>
            ${itemsHtml}

            <p><strong>Total:</strong> $${totalPrice}</p>

            <h3>Shipping To:</h3>
            <p>${fullName}<br>${address}<br>${city}, ${state} ${zip}</p>

            <p>Thanks for shopping at our record store!</p>
          `,
        });
      }
    } else {
      console.warn(`⚠️ No cart items found for session ${session.id}`);
    }
  }

  res.json({ received: true });
};

router.post("/", createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;
