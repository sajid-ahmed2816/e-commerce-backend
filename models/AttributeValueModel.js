const mongoose = require("mongoose");

const attributeValueSchema = mongoose.Schema({

  attribute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
    required: true
  },

  value: {
    type: String,
    required: true,
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

attributeValueSchema.index(
  { attribute: 1, value: 1 },
  { unique: true }
);

const AttributeValueModel = mongoose.model("AttributeValue", attributeValueSchema);

module.exports = AttributeValueModel;