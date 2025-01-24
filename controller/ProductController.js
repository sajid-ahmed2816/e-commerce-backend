const { SendResponse } = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");

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
    const existingCategory = await CategoryModel.findById(category);
    if (!existingCategory) {
      return res
        .status(400)
        .send(SendResponse(false, null, "Category does not exist."));
    }
    const result = new ProductModel(obj);
    await result.save();
    if (!result) {
      res.status(400).send(SendResponse(false, null, "Internal error"));
    }
    const populatedResult = await ProductModel.findById(result._id).populate("category");
    return res.status(200).send(SendResponse(true, populatedResult, "Created Successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

module.exports = { CreateProduct };