const SubscriptionModel = require('../models/SubscriptionModel');

const Subscription = async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  try {
    const result = await SubscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
};

module.exports = { Subscription };