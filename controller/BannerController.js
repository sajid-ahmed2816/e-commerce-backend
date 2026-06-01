const Paginate = require("../helper/Paginate");
const { SendResponse } = require("../helper/SendResponse");
const BannerModel = require("../models/BannerModel");
const CategoryModel = require("../models/CategoryModel");

const Banners = async (req, res) => {
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
        { tagline: { $regex: search, $options: "i" } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : [])
      ];
    };
    const populate = "category";
    const result = await Paginate({
      model: BannerModel,
      query,
      page,
      limit,
      populate
    });
    if (result) {
      return res.status(200).send(SendResponse(
        true, {
        banners: result.data,
        pagination: result.pagination,
      },
        "All Banners"
      ));
    }
  } catch (err) {
    return res.status(500).send(SendResponse(null, null, "Internal server error", err.message));
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

const UpdateStatus = async (req, res) => {
  let { id } = req.params;
  let { isActive } = req.body;
  let obj = {
    isActive: isActive,
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await BannerModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Banner not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
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

module.exports = { Banners, CreateBanner, EditBanner, DeleteBanner, UpdateStatus };
