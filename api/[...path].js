require("dotenv").config();

const mongoose = require("mongoose");
const app = require("../server");

let connectionPromise;

module.exports = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    connectionPromise ||= mongoose.connect(process.env.MONGO_URI);
    try {
      await connectionPromise;
    } catch (error) {
      connectionPromise = undefined;
      console.error("MongoDB connection failed", error);
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }
  }

  return app(req, res);
};
