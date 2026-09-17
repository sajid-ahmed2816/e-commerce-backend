const { SendResponse } = require("../helper/SendResponse");
const CategoryModel = require("../models/CategoryModel");
const BannerModel = require("../models/BannerModel");
const AttributeModel = require("../models/AttributeModel");
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
    const finalLimit = limit === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(limit);
    const result = await Paginate({
      model: CategoryModel,
      query,
      page: parseInt(page),
      limit: finalLimit,
      populate: [
        {
          path: "parent",
          select: "name"
        },
        {
          path: "attributes",
          select: "name"
        },
      ]
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
  const { name, type, image, isPopular, parent, attributes } = req.body;
  const obj = { name, type, image, isPopular, parent: parent || null, attributes: attributes || [], };
  const reqArr = ["name", "image"];
  const errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    };
  });

  if (errArr.length > 0) {
    return res.status(400).send(SendResponse(false, null, `Required all data`));
  };

  if (attributes !== undefined && !Array.isArray(attributes)) {
    return res.status(400).send(SendResponse(false, null, "Attributes must be an array"));
  };

  try {
    const existing = await CategoryModel.findOne({ name });
    if (existing) {
      return res.status(409).send(SendResponse(false, null, "Category name already exists"));
    };

    if (parent) {
      const parentCategory = await CategoryModel.findById(parent);

      if (!parentCategory) {
        return res.status(400).send(SendResponse(false, null, "Parent category not found"));
      };

      if (parentCategory.parent) {
        return res.status(400).send(SendResponse(false, null, "Only parent categories can be selected"));
      };
    };

    if (attributes && attributes.length > 0) {
      const uniqueAttributes = [...new Set(attributes.map(String))];

      if (uniqueAttributes.length !== attributes.length) {
        return res.status(400).send(SendResponse(false, null, "Duplicate attributes are not allowed"));
      };

      const attributeCount = await AttributeModel.countDocuments({ _id: { $in: attributes } });

      if (attributeCount !== attributes.length) {
        return res.status(400).send(SendResponse(false, null, "One or more attributes not found"));
      };
    };

    const result = new CategoryModel(obj);
    await result.save();

    return res.status(201).send(SendResponse(true, result, "Created Successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const EditCategory = async (req, res) => {
  const { id } = req.params;
  const { name, type, image, isPopular, parent, attributes } = req.body;
  const obj = {};

  if (name) obj.name = name;
  if (type) obj.type = type;
  if (image) obj.image = image;
  if (isPopular !== undefined) obj.isPopular = isPopular;
  if (parent !== undefined) obj.parent = parent || null;
  if (attributes !== undefined) obj.attributes = attributes;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    if (name) {
      const existing = await CategoryModel.findOne({ name, _id: { $ne: id } });
      if (existing) {
        return res.status(409).send(SendResponse(false, null, "Category name already exists"));
      };
    };

    if (parent) {
      if (parent === id) {
        return res.status(400).send(SendResponse(false, null, "Category cannot be its own parent"));
      };

      const parentCategory = await CategoryModel.findById(parent);

      if (!parentCategory) {
        return res.status(400).send(SendResponse(false, null, "Parent category not found"));
      };

      if (parentCategory.parent) {
        return res.status(400).send(SendResponse(false, null, "Only parent categories can be selected"));
      };
    };

    if (attributes !== undefined) {
      if (!Array.isArray(attributes)) {
        return res.status(400).send(SendResponse(false, null, "Attributes must be an array"));
      };

      if (attributes.length > 0) {
        const uniqueAttributes = [...new Set(attributes.map(String))];

        if (uniqueAttributes.length !== attributes.length) {
          return res.status(400).send(SendResponse(false, null, "Duplicate attributes are not allowed"));
        };

        const attributeCount = await AttributeModel.countDocuments({ _id: { $in: attributes } });

        if (attributeCount !== attributes.length) {
          return res.status(400).send(SendResponse(false, null, "One or more attributes not found"));
        };
      };
    };

    const result = await CategoryModel.findByIdAndUpdate(id, obj, { new: true });

    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Category not found"));
    };

    return res.status(200).send(SendResponse(true, result, "Updated Successfully"));

  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const UpdateStatus = async (req, res) => {
  let { id } = req.params;
  let { isActive } = req.body;
  let obj = {
    isActive: isActive
  };

  if (isActive === undefined) {
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
    const result = await CategoryModel.findById(id);

    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Category not found"));
    };

    const childCount = await CategoryModel.countDocuments({ parent: id });

    if (childCount > 0) {
      return res.status(400).send(SendResponse(false, null, "Cannot delete category with child categories"));
    };

    await CategoryModel.findByIdAndDelete(id);
    await BannerModel.deleteMany({ category: id });

    return res.status(200).send(SendResponse(true, null, "Deleted successfully"));
  } catch (err) {
    return res.status(404).send(SendResponse(false, null, "Internal server error"));
  };
}

module.exports = { AllCategories, CreateCategory, EditCategory, DeleteCategory, UpdateStatus };
