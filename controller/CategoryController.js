const { SendResponse } = require("../helper/SendResponse");
const CategoryModel = require("../models/CategoryModel");

const CreateCategory = async (req, res) => {
  let { name, type, image } = req.body;
  let obj = { name, type, image };
  let reqArr = ["name", "type", "image"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    res.send(SendResponse(false, null, "Required all data")).status(400);
  }

  try {
    const result = new CategoryModel(obj);
    await result.save();
    if (!result) {
      res.send(SendResponse(false, null, "Internal error")).status(400);
    } else {
      res.send(SendResponse(true, result, "Created Successfully")).status(200);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = CreateCategory;
