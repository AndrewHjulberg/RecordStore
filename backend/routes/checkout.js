import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

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

    // 1️⃣ Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { listing: true },
    });

    if (cartItems.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    // 2️⃣ Prepare Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.listing.title,
          description: item.listing.artist,
          images: [item.listing.imageUrl],
        },
        unit_amount: Math.round(item.listing.price * 100),
      },
      quantity: 1,
    }));

    // 3️⃣ Create Stripe session
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

    // 4️⃣ Optional: store Stripe session ID in cart items
    await prisma.cartItem.updateMany({
      where: { userId },
      data: { stripeSessionId: session.id }, // make sure this column exists exactly
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

    // ✅ Prefer Stripe-collected shipping info, fallback to metadata
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

    // Fetch cart items linked to this session
    const cartItems = await prisma.cartItem.findMany({
      where: { stripeSessionId: session.id },
      include: { listing: true },
    });

    if (cartItems.length > 0) {
      const totalPrice = cartItems.reduce((sum, item) => sum + item.listing.price, 0);

      // ✅ Create order including real shipping info
      await prisma.order.create({
        data: {
          userId,
          totalPrice,
          status: "paid",
          stripeSessionId: session.id,
          shippingAddress: `${fullName}, ${address}, ${city}, ${state} ${zip}`,
          items: {
            create: cartItems.map((item) => ({
              listingId: item.listingId,
              price: item.listing.price,
            })),
          },
        },
      });

      // Clear the user's cart
      await prisma.cartItem.deleteMany({ where: { stripeSessionId: session.id } });

      console.log(`✅ Order created for user ${userId} with shipping: ${fullName}, ${address}, ${city}, ${state} ${zip}`);
    } else {
      console.warn(`⚠️ No cart items found for session ${session.id}`);
    }
  }

  res.json({ received: true });
};


// --- Optional router for normal usage ---
router.post("/", createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;
