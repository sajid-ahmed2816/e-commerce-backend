const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.role === "admin";
    }
  },
  picture: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
