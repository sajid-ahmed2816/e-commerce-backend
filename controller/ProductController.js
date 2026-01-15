const { SendResponse } = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const Paginate = require("../helper/Paginate");

const AllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category } = req.query;
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
    const result = await Paginate({
      model: ProductModel,
      query,
      page,
      limit,
      populate: ["category", "size"],
    });
    if (result) {
      res.status(200).send(SendResponse(
        true,
        {
          products: result.data,
          pagination: result.pagination,
        },
        "All products"
      ));
    };
  } catch (error) {
    res.status(500).send(SendResponse(null, null, "Internal server error"))
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
  let { name, category, size, description, image, price, } = req.body;
  let obj = {};
  if (name) obj.name = name;
  if (category) obj.category = category;
  if (size) obj.size = size;
  if (description) obj.description = description;
  if (image) obj.image = image;
  if (price) obj.price = price;

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

module.exports = { AllProducts, CreateProduct, UpdateProduct, DeleteProduct, UpdateStatus };