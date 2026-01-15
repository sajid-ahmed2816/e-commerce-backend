const mongoose = require("mongoose");

const sizeSchema = mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
});

const SizeModel = mongoose.model("Size", sizeSchema);
module.exports = SizeModel;
