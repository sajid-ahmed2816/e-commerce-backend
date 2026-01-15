const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
  tagline: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    required: true,
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

const BannerModel = mongoose.model("Banner", bannerSchema);
module.exports = BannerModel;