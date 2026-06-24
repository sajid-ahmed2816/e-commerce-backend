const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: String,
    auth: String,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  createdAt: { type: Date, default: Date.now },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
module.exports = SubscriptionModel;