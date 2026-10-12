const { SendResponse } = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const Paginate = require("../helper/Paginate");
const multer = require("multer");
const XLSX = require("xlsx");
const ProductVariantModel = require("../models/ProductVariantModel");
const cloudinary = require("../config/CloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowedFormats: ["jpg", "png"],
  }
});

const thumbnailUpload = multer({
  storage: imageStorage
});

const excelUpload = multer({
  storage: multer.memoryStorage()
});

const AllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
    let query = {};

    if (search) {
      let categoryIds = [];
      if (!category) {
        const categories = await CategoryModel.find({
          name: { $regex: search, $options: "i" }
        }).select("_id");
        categoryIds = categories.map(c => c._id);
      };
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : [])
      ];
    };

    if (category) {
      query.category = category;
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      const variantPriceQuery = {
        isActive: true
      };

      if (minPrice && !isNaN(parseFloat(minPrice))) {
        variantPriceQuery.price = {
          $gte: parseFloat(minPrice)
        };
      };

      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        variantPriceQuery.price = {
          ...(variantPriceQuery.price || {}),
          $lte: parseFloat(maxPrice)
        };
      };

      const variantProductIds = await ProductVariantModel.find(variantPriceQuery).distinct("product");

      query._id = {
        $in: variantProductIds
      };
    };

    if (req.query.isFeatured !== undefined) {
      const isFeatured = req.query.isFeatured === 'true' || req.query.isFeatured === '1';
      query.isFeatured = isFeatured;
    };

    const finalLimit = limit === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(limit);
    const result = await Paginate({
      model: ProductModel,
      query,
      page: parseInt(page),
      limit: finalLimit,
      populate: ["category"],
    });

    const productIds = result.data.map((product) => product._id);

    const variants = await ProductVariantModel.find({
      product: { $in: productIds },
      isActive: true,
    }).select("product price").sort({ price: 1 }).lean();

    const variantPriceMap = new Map();

    variants.forEach((variant) => {
      const productId = variant.product.toString();

      if (!variantPriceMap.has(productId)) {
        variantPriceMap.set(productId, variant.price);
      }
    });

    const products = result.data.map((product) => {
      const productObj = product.toObject ? product.toObject() : product;

      return {
        ...productObj,
        minVariantPrice: variantPriceMap.get(product._id.toString()) ?? null,
      };
    });

    if (result) {
      return res.status(200).send(SendResponse(
        true,
        {
          products,
          pagination: result.pagination,
        },
        "All products"
      ));
    };
  } catch (error) {
    return res.status(500).send(SendResponse(null, null, "Internal server error"))
  };
};

const GetProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await ProductModel.findById(id).populate("category");

    if (!product) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    }

    const variants = await ProductVariantModel.find({
      product: product._id,
      isActive: true
    }).populate("attributes.attribute", "name").populate("attributes.value", "value");

    return res.status(200).send(
      SendResponse(
        true,
        {
          product,
          variants
        },
        "Product fetched successfully"
      )
    );

  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

const CreateProduct = async (req, res) => {
  let { name, category, description } = req.body;

  if (!req.file) {
    return res.status(400).send(SendResponse(false, null, "Thumbnail is required"));
  };

  const requiredFields = { name, category, description };
  const missingFields = Object.keys(requiredFields).filter((field) => !requiredFields[field]);

  if (missingFields.length > 0) {
    return res.status(400).send(SendResponse(false, null, `Required fields: ${missingFields.join(", ")}`));
  };

  try {
    const obj = {
      name,
      category,
      description,
      thumbnail: req.file.path,
      thumbnailPublicId: req.file.filename,
    };

    const result = new ProductModel(obj);

    await result.save();

    return res.status(200).send(SendResponse(true, result, "Product Created Successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const UpdateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, isFeatured } = req.body;

  const obj = {};

  if (name) obj.name = name;
  if (category) obj.category = category;
  if (description) obj.description = description;
  if (isFeatured !== undefined) obj.isFeatured = isFeatured;
  if (req.file) {
    obj.thumbnail = req.file.path;
    obj.thumbnailPublicId = req.file.filename;
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    };

    const oldThumbnailPublicId = existingProduct.thumbnailPublicId;

    const result = await ProductModel.findByIdAndUpdate(id, obj, { new: true, runValidators: true });

    if (req.file && oldThumbnailPublicId) {
      try {
        await cloudinary.uploader.destroy(oldThumbnailPublicId);
      } catch (deleteError) {
        console.log("Old thumbnail delete failed:", deleteError);
      }
    };

    return res.status(200).send(SendResponse(true, result, "Updated Successfully"));
  } catch (error) {
    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.log("New thumbnail cleanup failed:", cleanupError);
      }
    };
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const UpdateStatus = async (req, res) => {
  let { id } = req.params;
  let { isActive } = req.body;
  let obj = {
    isActive: isActive
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await ProductModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
    };
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const DeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ProductModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Product not available"));
    } else {
      return res.status(200).send(SendResponse(true, null, "Product deleted successfully"));
    };
  } catch (error) {
    return res.status(500).send(SendResponse(false, error, "Internal Sever Error"));
  };
};

const BulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send(SendResponse(false, null, "No file uploaded"));
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).send(SendResponse(false, null, "Excel file is empty"));
    }

    const productsToInsert = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      // Trim all string values (remove extra spaces, tabs)
      Object.keys(row).forEach(key => {
        if (typeof row[key] === 'string') {
          row[key] = row[key].trim();
        }
      });

      const requiredFields = ["name", "category", "description"];
      const missing = requiredFields.filter(f => !row[f]);
      if (missing.length) {
        errors.push({ row: rowNumber, error: `Missing required fields: ${missing.join(", ")}` });
        continue;
      }

      // Category resolution (mandatory)
      let category = await CategoryModel.findOne({
        name: { $regex: `^${row.category}$`, $options: "i" }
      });

      if (!category) {
        category = await CategoryModel.create({
          name: row.category,
          parent: null,
          image: null,
          isActive: false,
          isPopular: false,
        });
      }

      // Prepare product object
      productsToInsert.push({
        name: row.name,
        category: category._id,
        description: row.description,
        isActive: row.isActive ? row.isActive.toString().toLowerCase() === "true" : true,
      });
    };

    console.log(`Total products to insert: ${productsToInsert.length}`);

    let insertedCount = 0;
    if (productsToInsert.length) {
      try {
        const result = await ProductModel.insertMany(productsToInsert, { ordered: false });
        insertedCount = result.length;
        console.log(`Inserted ${insertedCount} products`);
      } catch (bulkError) {
        console.error("Bulk insert error:", bulkError);
        if (bulkError.code === 11000 || bulkError.name === "BulkWriteError") {
          insertedCount = bulkError.insertedDocs?.length || 0;
          if (bulkError.writeErrors) {
            bulkError.writeErrors.forEach(err => {
              errors.push({ row: "unknown", error: err.errmsg });
            });
          }
        } else {
          throw bulkError;
        }
      }
    } else {
      console.warn("No products to insert");
    }

    return res.status(200).send(SendResponse(
      true,
      {
        totalRows: rows.length,
        inserted: insertedCount,
        failed: errors.length,
        errors,
      },
      "Bulk upload completed"
    ));
  } catch (error) {
    console.error("Outer catch:", error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

module.exports = {
  AllProducts,
  GetProductById,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  UpdateStatus,
  BulkUploadProducts,
  thumbnailUpload,
  excelUpload
};