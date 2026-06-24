const NotificationModel = require("../models/NotificationModel");

const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationModel.countDocuments({ read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await NotificationModel.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  };
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };