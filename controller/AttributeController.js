const { SendResponse } = require("../helper/SendResponse");
const AttributeModel = require("../models/AttributeModel");
const AttributeValueModel = require("../models/AttributeValueModel");
const Paginate = require("../helper/Paginate");

const AllAttributes = async (req, res) => {
  try {
    const { search, page = 1, limit = 1 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    };

    const finalLimit = limit === "all" ? Number.MAX_SAFE_INTEGER() : parseInt(limit);

    const result = await Paginate({
      model: AttributeModel,
      query,
      page: parseInt(page),
      limit: finalLimit
    });

    return res.status(200).send(SendResponse(true, { attributes: result.data, pagination: result.pagination }, "All attributes"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const CreateAttribute = async (req, res) => {
  const { name, description } = req.body;
  const obj = { name, description };

  if (!name) {
    return res.status(400).send(SendResponse(false, null, "Attribute name is required"));
  };
  try {
    const existing = await AttributeModel.findOne({ name });

    if (existing) {
      return res.status(409).send(SendResponse(false, null, "Attribute name already exist"));
    };

    const result = await new AttributeModel(obj);

    await result.save();

    return res.status(201).send(SendResponse(true, result, "Attribute created successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const EditAttribute = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const obj = {};

  if (name) obj.name = name;
  if (description) obj.description = description;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const attribute = await AttributeModel.findById(id);

    if (!attribute) {
      return res.status(404).send(SendResponse(false, null, "Attribute not found"));
    };

    const existing = await AttributeModel.findOne({ name: name.trim(), _id: { $ne: id } });

    if (existing) {
      return res.status(409).send(SendResponse(false, null, "Attribute name already exist"));
    };

    const result = await AttributeModel.findByIdAndUpdate(id, obj, { new: true });

    return res.status(200).send(SendResponse(true, result, "Attribute updated successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const UpdateStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await AttributeModel.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Attribute not found"));
    };

    return res.status(200).send(SendResponse(true, result, "Status updated successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const DeleteAttribute = async (req, res) => {
  const { id } = req.params;
  try {
    const attribute = await AttributeModel.findById(id);

    if (!attribute) {
      return res.status(404).send(SendResponse(false, null, "Attribute not found"));
    };

    const valueCount = await AttributeValueModel.countDocuments({ attribute: id, });

    if (valueCount > 0) {
      return res.status(400).send(SendResponse(false, null, "Cannot delete attribute with attribute values"));
    };

    await AttributeModel.findByIdAndDelete(id);

    return res.status(200).send(SendResponse(true, null, "Attribute deleted successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

module.exports = {
  AllAttributes,
  CreateAttribute,
  EditAttribute,
  UpdateStatus,
  DeleteAttribute
};