const mongoose = require("mongoose");

const generateOrderNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderNo = "";
  for (let i = 0; i < 8; i++) {
    orderNo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return orderNo;
};

const orderSchema = mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
    default: generateOrderNumber,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    }
  }],
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
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
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
});

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;