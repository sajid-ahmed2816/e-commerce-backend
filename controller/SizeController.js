const { SendResponse } = require("../helper/SendResponse");
const SizeModel = require("../models/SizeModel");
const Paginate = require("../helper/Paginate");

const AllSizes = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { size: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    };
    const result = await Paginate({
      model: SizeModel,
      query,
      page,
      limit,
    });
    if (result) {
      res.status(200).send(SendResponse(
        true,
        {
          sizes: result.data,
          pagination: result.pagination,
        },
        "All sizes"
      ));
    };
  } catch (err) {
    res.status(500).send(SendResponse(false, null, "Internal server error", err.message));
  };
};

const CreateSize = async (req, res) => {
  let { size, description } = req.body;
  let obj = { size, description };
  let reqArr = ["size", "description"];
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
    const result = new SizeModel(obj);
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

const EditSize = async (req, res) => {
  let { id } = req.params;
  let { size, description } = req.body;
  let obj = {};
  if (size) obj.size = size;
  if (description) obj.description = description;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await SizeModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Category not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteSize = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await SizeModel.findByIdAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "Size not found")).status(404);
    } else {
      res.send(SendResponse(true, null, "Size deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { AllSizes, CreateSize, EditSize, DeleteSize };
