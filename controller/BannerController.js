const { SendResponse } = require("../helper/SendResponse");
const BannerModel = require("../models/BannerModel");

const Banners = async (req, res) => {
  try {
    let result = await BannerModel.find().populate("category");
    if (result) {
      res.send(SendResponse(true, { banners: result }, "All Banners")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(null, null, "Internal server error").status(500));
  }
};

const CreateBanner = async (req, res) => {
  let { tagline, category, image } = req.body;
  let obj = { tagline, category, image };
  let reqArr = ["tagline", "category", "image"];
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
    const result = new BannerModel(obj);
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

const EditBanner = async (req, res) => {
  let { id } = req.params;
  let { tagline, image, category } = req.body;
  let obj = {
    ...(tagline && { tagline }),
    ...(category && { category }),
    ...(image && { image }),
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await BannerModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Banner not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteBanner = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await BannerModel.findOneAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "Banner not found")).status(404);
    } else {
      res.send(SendResponse(true, null, "Deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { Banners, CreateBanner, EditBanner, DeleteBanner };
