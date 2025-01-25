const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { SendResponse } = require("../helper/SendResponse");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
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
