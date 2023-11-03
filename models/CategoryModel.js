const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
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
});

const CategoryModel = mongoose.model("Category", categorySchema);
module.exports = CategoryModel;
