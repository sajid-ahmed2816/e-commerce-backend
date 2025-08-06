const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  },
});

const BlogModel = mongoose.model("Blog", blogSchema);
module.exports = BlogModel;
