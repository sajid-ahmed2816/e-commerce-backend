const SendResponse = require("../helper/SendResponse");
const ProductModel = require("../models/ProductModel");

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
    res.send(SendResponse(false, null, "Required all data")).status(400);
  };

  try {
    const result = new ProductModel(obj);
    await result.save();
    if (!result) {
      res.send(SendResponse(false, null, "Internal error")).status(400);
    } else {
      res.send(SendResponse(true, result, "Created Successfully")).status(200);
    }
  } catch (error) {
    console.log(error);
  }
}