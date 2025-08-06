const { SendResponse } = require("../helper/SendResponse");
const AboutModel = require("../models/AboutModel");

const Abouts = async (req, res) => {
  try {
    let result = await AboutModel.find();
    if (result) {
      res.send(SendResponse(true, result, "All Blogs")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(null, null, "Internal server error").status(500));
  }
};

const CreateAbout = async (req, res) => {
  let { name, image, content } = req.body;
  let obj = { name, image, content };
  let reqArr = ["name", "image", "content"];
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
    const result = new AboutModel(obj);
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

const EditAbout = async (req, res) => {
  let { id } = req.params;
  let { name, type, image, content, date } = req.body;
  let obj = {
    ...(name && { name }),
    ...(image && { image }),
    ...(content && { content }),
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await AboutModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Blog not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteAbout = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await AboutModel.findOneAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "About not found")).status(404);
    } else {
      res.send(SendResponse(true, null, "Deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { Abouts, CreateAbout, EditAbout, DeleteAbout };
