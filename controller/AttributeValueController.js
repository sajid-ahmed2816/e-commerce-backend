const { SendResponse } = require("../helper/SendResponse");
const AttributeModel = require("../models/AttributeModel");
const AttributeValueModel = require("../models/AttributeValueModel");
const Paginate = require("../helper/Paginate");

const AllAttributeValues = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { value: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    };

    const finalLimit = limit === "all" ? Number.MAX_SAFE_INTEGER : parseInt(limit);

    const result = await Paginate({
      model: AttributeValueModel,
      query,
      page: parseInt(page),
      limit: finalLimit,
      populate: {
        path: "attribute",
        select: "name"
      }
    });

    return res.status(200).send(SendResponse(true, { attributeValues: result.data, pagination: result.pagination }, "All attribute values"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const CreateAttributeValue = async (req, res) => {
  const { attribute, value, description } = req.body;

  if (!attribute || !value) {
    return res.status(400).send(SendResponse(false, null, "Attribute and value are required"));
  };

  try {
    const attributeExists = await AttributeModel.findById(attribute);

    if (!attributeExists) {
      return res.status(400).send(SendResponse(false, null, "Attribute not found"));
    };

    const existing = await AttributeValueModel.findOne({ attribute: attribute, value: value.trim() });

    if (existing) {
      return res.status(409).send(SendResponse(false, null, "Attribute value already exists"));
    };


    const obj = { attribute, value: value.trim(), description };

    const result = new AttributeValueModel(obj);

    await result.save();

    return res.status(201).send(SendResponse(true, result, "Created Successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const EditAttributeValue = async (req, res) => {
  const { id } = req.params;
  const { value, description } = req.body;
  const obj = {};

  if (value) obj.value = value.trim();
  if (description !== undefined) obj.description = description;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const attributeValue = await AttributeValueModel.findById(id);

    if (!attributeValue) {
      return res.status(404).send(SendResponse(false, null, "Attribute value not found"));
    };

    if (value) {
      const existing = await AttributeValueModel.findOne({
        attribute: attributeValue.attribute,
        value: value.trim(),
        _id: { $ne: id }
      });

      if (existing) {
        return res.status(409).send(SendResponse(false, null, "Attribute value already exists"));
      };
    };

    const result = await AttributeValueModel.findByIdAndUpdate(id, obj, { new: true });

    return res.status(200).send(SendResponse(true, result, "Updated Successfully"));
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
    const result = await AttributeValueModel.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Attribute value not found"));
    };

    return res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

const DeleteAttributeValue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await AttributeValueModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Attribute value not found"));
    };

    return res.status(200).send(SendResponse(true, null, "Attribute value deleted successfully"));
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
};

module.exports = {
  AllAttributeValues,
  CreateAttributeValue,
  EditAttributeValue,
  UpdateStatus,
  DeleteAttributeValue
};