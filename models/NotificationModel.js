const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNo: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model('Notification', notificationSchema);
module.exports = NotificationModel;