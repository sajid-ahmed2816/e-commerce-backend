const { SendResponse } = require("../helper/SendResponse");
const ProductVariantModel = require("../models/ProductVariantModel");
const ProductModel = require("../models/ProductModel");
const AttributeModel = require("../models/AttributeModel");
const AttributeValueModel = require("../models/AttributeValueModel");
const OrderModel = require("../models/OrderModel");
const cloudinary = require("../config/CloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { populate } = require("dotenv");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowedFormats: ["jpg", "png"],
  }
});

const upload = multer({
  storage: storage
});

const CreateProductVariant = async (req, res) => {
  let variants;

  try {
    try {
      variants = JSON.parse(req.body.variants);
    } catch (error) {
      return res.status(400).send(SendResponse(false, null, "Invalid variants data"));
    };

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).send(SendResponse(false, null, "Variants must be a non-empty array"));
    };

    const productIds = [...new Set(variants.map((variant) => String(variant.product)))];

    if (productIds.length !== 1) {
      return res.status(400).send(SendResponse(false, null, "All variants must belong to the same product"));
    };

    const product = productIds[0];
    const productExists = await ProductModel.findById(product).populate("category");

    if (!productExists) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    };

    const category = productExists.category;

    if (!category) {
      return res.status(400).send(SendResponse(false, null, "Product category not found"));
    };

    const categoryAttributeIds = category.attributes.map((attribute) => String(attribute));

    for (const variant of variants) {
      const { sku, attributes, price, stock } = variant;

      if (!sku || price === undefined || stock === undefined) {
        return res.status(400).send(SendResponse(false, null, "SKU, price and stock are required for all variants"));
      };

      if (attributes !== undefined && !Array.isArray(attributes)) {
        return res.status(400).send(SendResponse(false, null, "Attributes must be an array"));
      }
    };

    const skus = variants.map((variant) => variant.sku.trim());
    const uniqueSkus = [...new Set(skus)];

    if (uniqueSkus.length !== skus.length) {
      return res.status(409).send(SendResponse(false, null, "Duplicate SKU found in request"));
    };

    const existingSkus = await ProductVariantModel.find({
      sku: { $in: uniqueSkus }
    }).select("sku");

    if (existingSkus.length > 0) {
      return res.status(409).send(SendResponse(false, null, `SKU already exists: ${existingSkus[0].sku}`));
    };

    const preparedVariants = [];

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      const { sku, attributes, price, stock } = variant;

      const variantAttributes = attributes || [];

      if (variantAttributes.length > 0) {
        const attributeIds = variantAttributes.map((item) => String(item.attribute));

        const uniqueAttributeIds = [
          ...new Set(attributeIds)
        ];

        if (uniqueAttributeIds.length !== attributeIds.length) {
          return res.status(400).send(SendResponse(false, null, `Duplicate attributes are not allowed for SKU ${sku}`));
        };

        const invalidAttribute = variantAttributes.find((item) =>
          !categoryAttributeIds.includes(String(item.attribute))
        );

        if (invalidAttribute) {
          return res.status(400).send(SendResponse(false, null, `One or more attributes are not allowed for SKU ${sku}`));
        };

        const attributeCount = await AttributeModel.countDocuments({
          _id: { $in: uniqueAttributeIds }
        });

        if (attributeCount !== uniqueAttributeIds.length) {
          return res.status(400).send(SendResponse(false, null, `One or more attributes not found for SKU ${sku}`));
        };

        for (const item of variantAttributes) {
          const attributeValue =
            await AttributeValueModel.findOne({
              _id: item.value,
              attribute: item.attribute
            });

          if (!attributeValue) {
            return res.status(400).send(SendResponse(false, null, `Attribute value does not belong to the selected attribute for SKU ${sku}`));
          };
        };
      };

      const combinationParts = variantAttributes.map((item) => `${item.attribute}:${item.value}`).sort();
      const combinationKey = combinationParts.length ? combinationParts.join("|") : "NO_ATTRIBUTES";
      const variantImages = (req.files || []).filter((file) => file.fieldname === `images_${index}`).map((file) => (
        {
          url: file.path,
          public_id: file.filename
        }
      ));

      preparedVariants.push({
        product,
        sku: sku.trim(),
        attributes: variantAttributes,
        combinationKey,
        price,
        stock,
        images: variantImages
      });
    };

    const combinationKeys = preparedVariants.map((variant) => variant.combinationKey);
    const uniqueCombinationKeys = [...new Set(combinationKeys)];

    if (uniqueCombinationKeys.length !== combinationKeys.length) {
      return res.status(409).send(SendResponse(false, null, "Duplicate product variant combination found in request"));
    };

    const existingCombinations = await ProductVariantModel.find({
      product,
      combinationKey: { $in: uniqueCombinationKeys }
    }).select("combinationKey sku");

    if (existingCombinations.length > 0) {
      return res.status(409).send(SendResponse(false, null, "One or more product variant combinations already exist"));
    };

    const result = await ProductVariantModel.insertMany(preparedVariants);

    return res.status(201).send(
      SendResponse(
        true,
        result,
        `${result.length} product variant${result.length > 1 ? "s" : ""
        } created successfully`
      )
    );
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const AllProductVariants = async (req, res) => {
  try {
    const { product, page = 1, limit = 10 } = req.query;
    const query = {};

    if (product) {
      query.product = product;
    };

    const result = await ProductVariantModel
      .find(query)
      .populate("product", "name")
      .populate("attributes.attribute", "name")
      .populate("attributes.value", "value")
      .sort({ createdAt: -1 })
      .skip(
        (Number(page) - 1) * Number(limit)
      )
      .limit(Number(limit));

    const total = await ProductVariantModel.countDocuments(query);

    return res.status(200).send(
      SendResponse(
        true,
        {
          variants: result,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(
              total / Number(limit)
            )
          }
        },
        "Product variants fetched successfully"
      )
    );
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const GetProductVariant = async (req, res) => {
  const { id } = req.params;

  try {
    const variant = await ProductVariantModel
      .findById(id)
      .populate({
        path: "product",
        select: "name category",
        populate: { path: "category" }
      })
      .populate("attributes.attribute", "name")
      .populate("attributes.value", "value");

    if (!variant) {
      return res.status(404).send(SendResponse(false, null, "Product variant not found"));
    };

    return res.status(200).send(SendResponse(true, variant, "Product variant fetched successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message)
    );
  };
};

const UpdateProductVariant = async (req, res) => {
  const { id } = req.params;
  let { sku, attributes, price, stock, isActive, existingImages } = req.body;

  if (typeof existingImages === "string") {
    try {
      existingImages = JSON.parse(existingImages);
    } catch (error) {
      return res.status(400).send(SendResponse(false, null, "Invalid existing images data"));
    };
  };

  if (existingImages !== undefined && !Array.isArray(existingImages)) {
    return res.status(400).send(SendResponse(false, null, "Existing images must be an array"));
  };

  if (typeof attributes === "string") {
    try {
      attributes = JSON.parse(attributes);
    } catch (error) {
      return res.status(400).send(SendResponse(false, null, "Invalid attributes data"));
    };
  };

  if (
    sku === undefined &&
    attributes === undefined &&
    price === undefined &&
    stock === undefined &&
    isActive === undefined &&
    existingImages === undefined &&
    (!req.files || req.files.length === 0)
  ) {
    return res.status(400).send(SendResponse(false, null, "No data to update"));
  };

  if (attributes !== undefined && !Array.isArray(attributes)) {
    return res.status(400).send(SendResponse(false, null, "Attributes must be an array"));
  };

  try {
    const variant = await ProductVariantModel.findById(id);

    if (!variant) {
      return res.status(404).send(SendResponse(false, null, "Product variant not found"));
    };

    const productExists = await ProductModel.findById(variant.product).populate("category");

    if (!productExists) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    };

    const category = productExists.category;

    if (!category) {
      return res.status(400).send(SendResponse(false, null, "Product category not found"));
    };

    const categoryAttributeIds = category.attributes.map((attribute) => String(attribute));

    if (sku !== undefined) {
      const trimmedSku = sku.trim();

      if (!trimmedSku) {
        return res.status(400).send(SendResponse(false, null, "SKU cannot be empty"));
      };

      const existingSku = await ProductVariantModel.findOne({
        sku: trimmedSku,
        _id: { $ne: id }
      });

      if (existingSku) {
        return res.status(409).send(SendResponse(false, null, "SKU already exists"));
      };
    };

    const variantAttributes = attributes !== undefined ? attributes : variant.attributes;

    if (variantAttributes.length > 0) {
      const attributeIds = variantAttributes.map((item) => String(item.attribute));
      const uniqueAttributeIds = [...new Set(attributeIds)];

      if (uniqueAttributeIds.length !== attributeIds.length) {
        return res.status(400).send(SendResponse(false, null, "Duplicate attributes are not allowed"));
      };

      const invalidAttribute = variantAttributes.find((item) =>
        !categoryAttributeIds.includes(String(item.attribute))
      );

      if (invalidAttribute) {
        return res.status(400).send(SendResponse(false, null, "One or more attributes are not allowed for this product category"));
      };

      const attributeCount = await AttributeModel.countDocuments({
        _id: { $in: uniqueAttributeIds }
      });

      if (attributeCount !== uniqueAttributeIds.length) {
        return res.status(400).send(SendResponse(false, null, "One or more attributes not found"));
      };

      for (const item of variantAttributes) {
        const attributeValue = await AttributeValueModel.findOne({
          _id: item.value,
          attribute: item.attribute
        });

        if (!attributeValue) {
          return res.status(400).send(SendResponse(false, null, "Attribute value does not belong to the selected attribute"));
        };
      };
    };

    const combinationParts = variantAttributes.map((item) => `${item.attribute}:${item.value}`).sort();
    const combinationKey = combinationParts.length ? combinationParts.join("|") : "NO_ATTRIBUTES";
    const existingCombination = await ProductVariantModel.findOne({
      product: variant.product,
      combinationKey,
      _id: { $ne: id }
    });

    if (existingCombination) {
      return res.status(409).send(SendResponse(false, null, "This product variant combination already exists"));
    };

    const obj = {
      attributes: variantAttributes,
      combinationKey
    };

    if (sku !== undefined) {
      obj.sku = sku.trim();
    };

    if (price !== undefined) {
      obj.price = price;
    };

    if (stock !== undefined) {
      obj.stock = stock;
    };

    if (isActive !== undefined) {
      obj.isActive = isActive;
    };

    let removedImages = [];

    if (existingImages !== undefined || (req.files && req.files.length > 0)) {
      const currentImages = variant.images || [];
      const retainedImages = existingImages !== undefined
        ? currentImages.filter((image) => existingImages.includes(image.public_id))
        : currentImages;

      if (existingImages !== undefined) {
        removedImages = currentImages.filter((image) => !existingImages.includes(image.public_id));
      };

      const newImages = (req.files || []).map((file) => ({
        url: file.path,
        public_id: file.filename
      }));

      obj.images = [
        ...retainedImages,
        ...newImages
      ];
    };

    const result = await ProductVariantModel.findByIdAndUpdate(id, obj, { new: true, runValidators: true });

    for (const image of removedImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.log("old delete failed", error);
      }
    };

    return res.status(200).send(SendResponse(true, result, "Product variant updated successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const DeleteProductVariant = async (req, res) => {
  const { id } = req.params;
  const { product } = req.body;

  try {
    if (!product) {
      return res.status(400).send(SendResponse(false, null, "Product is required"));
    };

    const variant = await ProductVariantModel.findById(id);

    if (!variant) {
      return res.status(404).send(SendResponse(false, null, "Product variant not found"));
    };

    if (variant.product.toString() !== product.toString()) {
      return res.status(400).send(SendResponse(false, null, "Product variant does not belong to this product"));
    };

    const productExists = await ProductModel.exists({ _id: product });
    const orderExists = await OrderModel.exists({ "items.variant": variant._id });

    if (productExists || orderExists) {
      variant.isActive = false;

      await variant.save();

      return res.status(200).send(SendResponse(true, variant, "Product variant deleted successfully")
      );
    };

    for (const image of variant.images || []) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.log("delete failed", error);
      };
    };

    await ProductVariantModel.findByIdAndDelete(variant._id);

    return res.status(200).send(SendResponse(true, null, "Product variant deleted successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

module.exports = {
  CreateProductVariant,
  AllProductVariants,
  GetProductVariant,
  UpdateProductVariant,
  DeleteProductVariant,
  upload
};