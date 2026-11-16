const express = require("express");
const Stripe = require("stripe");
const { SendResponse } = require("../helper/SendResponse");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.post("/create-payment-intent", verifyToken(["admin", "user"]), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Payments are not configured on this server" });
    }
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;
    const amountInCents = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // e.g., 1000 = $10.00
      currency: "usd", // or "inr", etc.
    });

    res.send(SendResponse(true, {
      clientSecret: paymentIntent.client_secret,
    }, "Transaction completed successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
