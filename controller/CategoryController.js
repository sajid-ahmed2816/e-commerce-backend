const { SendResponse } = require("../helper/SendResponse");
const CategoryModel = require("../models/CategoryModel");
const BannerModel = require("../models/BannerModel");
const Paginate = require("../helper/Paginate");

const AllCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ]
    };
    const result = await Paginate({
      model: CategoryModel,
      query,
      page,
      limit,
    });
    if (result) {
      res.status(200).send(SendResponse(
        true,
        {
          categories: result.data,
          pagination: result.pagination,
        },
        "All categories"
      ));
    };
  } catch (err) {
    res.status(500).send(SendResponse(false, null, "Internal server error", err.message));
  };
};

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
    res.status(400).send(SendResponse(false, null, `Required all data`));
  }

  try {
    const result = new CategoryModel(obj);
    await result.save();
    if (!result) {
      res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      res.status(200).send(SendResponse(true, result, "Created Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const EditCategory = async (req, res) => {
  let { id } = req.params;
  let { name, type, image } = req.body;
  let obj = {};
  if (name) obj.name = name;
  if (type) obj.type = type;
  if (image) obj.image = image;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await CategoryModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Category not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
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
    const result = await CategoryModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Category not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await CategoryModel.findByIdAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "Category not found")).status(404);
    } else {
      await BannerModel.deleteMany({ category: id });
      res.send(SendResponse(true, null, "Deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { AllCategories, CreateCategory, EditCategory, DeleteCategory, UpdateStatus };
