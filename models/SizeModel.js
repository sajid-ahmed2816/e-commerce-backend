const mongoose = require("mongoose");

const sizeSchema = mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true
});

const SizeModel = mongoose.model("Size", sizeSchema);
module.exports = SizeModel;
