const { SendResponse } = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const Paginate = require("../helper/Paginate");
const multer = require("multer");
const XLSX = require("xlsx");
const SizeModel = require("../models/SizeModel");

const upload = multer({ storage: multer.memoryStorage() });

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
      query.price = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        query.price.$lte = parseFloat(maxPrice);
      }
      // Agar dono hi nahi diye (edge case) toh price filter hata do
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
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
      populate: ["category", "size"],
    });
    if (result) {
      return res.status(200).send(SendResponse(
        true,
        {
          products: result.data,
          pagination: result.pagination,
        },
        "All products"
      ));
    };
  } catch (error) {
    return res.status(500).send(SendResponse(null, null, "Internal server error"))
  };
};

const CreateProduct = async (req, res) => {
  let { name, category, size, description, image, price, } = req.body;
  let obj = { name, category, size, description, image, price };
  let reqArr = ["name", "category", "size", "description", "image", "price"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    return res.status(400).send(SendResponse(false, null, "Required all data"));
  };

  try {
    const result = new ProductModel(obj);
    await result.save();
    if (!result) {
      return res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Created Successfully"));
    };
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const UpdateProduct = async (req, res) => {
  let { id } = req.params;
  let { name, category, size, description, image, price, isFeatured } = req.body;
  let obj = {};
  if (name) obj.name = name;
  if (category) obj.category = category;
  if (size) obj.size = size;
  if (description) obj.description = description;
  if (image) obj.image = image;
  if (price) obj.price = price;
  obj.isFeatured = isFeatured;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await ProductModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    };
  } catch (error) {
    console.log(error);
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

      // Required fields – "size" ko hata diya (optional now)
      const requiredFields = ["name", "category", "description", "price"];
      const missing = requiredFields.filter(f => !row[f]);
      if (missing.length) {
        errors.push({ row: rowNumber, error: `Missing required fields: ${missing.join(", ")}` });
        continue;
      }

      // Category resolution (mandatory)
      const category = await CategoryModel.findOne({
        name: { $regex: `^${row.category}$`, $options: "i" }
      });
      if (!category) {
        errors.push({ row: rowNumber, error: `Category "${row.category}" not found` });
        continue;
      }

      // 🔹 Size resolution – optional now
      let sizeIds = [];
      if (row.size && row.size !== "") {
        let sizeDoc = await SizeModel.findOne({
          size: { $regex: `^${row.size}$`, $options: "i" }
        });
        if (!sizeDoc) {
          // Auto-create new size
          sizeDoc = await SizeModel.create({ size: row.size });
          console.log(`Auto-created new size: "${row.size}" with ID ${sizeDoc._id}`);
        }
        sizeIds = [sizeDoc._id];
      }
      // else sizeIds remains [] – product will have no size

      // Price validation
      const price = parseFloat(row.price);
      if (isNaN(price)) {
        errors.push({ row: rowNumber, error: `Invalid price: "${row.price}"` });
        continue;
      }

      // Image handling – default placeholder if missing
      const imageUrl = row.image && row.image.trim() !== ""
        ? row.image
        : "https://placehold.co/600x400?text=No+Image";

      // Prepare product object
      productsToInsert.push({
        name: row.name,
        category: category._id,
        size: sizeIds,           // empty array if no size
        description: row.description,
        image: imageUrl,
        price: price,
        isActive: row.isActive ? row.isActive.toString().toLowerCase() === "true" : true,
      });
    }

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
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  UpdateStatus,
  BulkUploadProducts,
  upload
};