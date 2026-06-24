const express = require('express');
const router = express.Router();
const { Subscription } = require("../controller/SubscriptionController");

router.post('/subscribe', Subscription);

module.exports = router;