const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require("../controller/NotificationController");

router.get('/all-notifications', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;