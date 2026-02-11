const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
});

const BlogModel = mongoose.model("Blog", blogSchema);
module.exports = BlogModel;
