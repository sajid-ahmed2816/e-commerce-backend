const mongoose = require("mongoose");

const productVariantSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  attributes: [
    {
      attribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true
      },

      value: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttributeValue",
        required: true
      }
    }
  ],

  combinationKey: {
    type: String,
    required: true
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  images: [
    {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

productVariantSchema.index({ product: 1, combinationKey: 1 }, { unique: true });

const ProductVariantModel = mongoose.model("ProductVariant", productVariantSchema);

module.exports = ProductVariantModel;