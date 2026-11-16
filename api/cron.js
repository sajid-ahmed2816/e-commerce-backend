require("dotenv").config();

const mongoose = require("mongoose");
const processOffers = require("../utils/cron");

module.exports = async (req, res) => {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await processOffers();
    return res.status(200).json({ success: true, message: "Offers processed" });
  } catch (error) {
    console.error("Vercel cron failed", error);
    return res.status(500).json({ success: false, message: "Offer processing failed" });
  }
};
