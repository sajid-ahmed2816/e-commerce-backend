const mongoose = require("mongoose");

const aboutSchema = mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true
  }
});

const AboutModel = mongoose.model("about", aboutSchema);
module.exports = AboutModel;
