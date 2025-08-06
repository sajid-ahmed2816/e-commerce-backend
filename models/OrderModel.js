const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  mobile: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
  },
  billingAddress: {
    type: String,
    required: true
  },
  shippingAddress: {
    type: String,
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
  },
  dc: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
});

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;