const mongoose = require("mongoose");

const attributeSchema = mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
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

const AttributeModel = mongoose.model("Attribute", attributeSchema);

module.exports = AttributeModel;