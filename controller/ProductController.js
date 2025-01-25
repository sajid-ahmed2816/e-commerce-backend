const { SendResponse } = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");

const AllProducts = async (req, res) => {
  try {
    const result = await ProductModel.find().populate("category");
    if (!result) {
      res.status(404).send(SendResponse(true, result, "No products available"));
    } else {
      res.status(200).send(SendResponse(true, result, "All products"));
    }
  } catch (error) {
    res.status(500).send(SendResponse(null, null, "Internal server error"))
  }
};

const CreateProduct = async (req, res) => {
  let { name, category, description, image, price, } = req.body;
  let obj = { name, category, description, image, price };
  let reqArr = ["name", "category", "description", "image", "price"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    res.status(400).send(SendResponse(false, null, "Required all data"));
  };

  try {
    const result = new ProductModel(obj);
    await result.save();
    if (!result) {
      return res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Created Successfully"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

const UpdateProduct = async (req, res) => {
  let { id } = req.params;
  let { name, category, description, image, price, } = req.body;
  let obj = {};
  if (name) obj.name = name;
  if (category) obj.category = category;
  if (description) obj.description = description;
  if (image) obj.image = image;
  if (price) obj.price = price;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await ProductModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Product not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

const DeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ProductModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Product not available"));
    } else {
      return res.status(200).send(SendResponse(true, null, "Product deleted successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, error, "Internal Sever Error"));
  }
}

module.exports = { AllProducts, CreateProduct, UpdateProduct, DeleteProduct };