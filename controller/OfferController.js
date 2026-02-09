const { SendResponse } = require("../helper/SendResponse");
const OfferModel = require("../models/OfferModel");
const Paginate = require("../helper/Paginate");

const AllOffers = async (req, res) => {
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
      model: OfferModel,
      query,
      page,
      limit,
    });
    if (result) {
      return res.status(200).send(SendResponse(
        true,
        {
          offers: result.data,
          pagination: result.pagination,
        },
        "All offers"
      ));
    };
  } catch (err) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", err.message));
  };
};

const CreateOffer = async (req, res) => {
  let { isActive, name, color, discountType, discountValue, startDate, endDate  } = req.body;
  let obj = { isActive, name, color, discountType, discountValue, startDate, endDate };
  let reqArr = [ "name", "color", "discountType", "discountValue", "startDate", "endDate"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    return res.status(400).send(SendResponse(false, null, `Required all data`));
  }

  try {
    const result = new OfferModel(obj);
    await result.save();
    if (!result) {
      return res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Created Successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  }
};

const EditOffer = async (req, res) => {
  let { id } = req.params;
  let { isActive, name, color, discountType, discountValue, startDate, endDate  } = req.body;
  let obj = {};
  if (isActive) obj.isActive = isActive;
  if (name) obj.name = name;
  if (color) obj.color = color;
  if (discountType) obj.discountType = discountType;
  if (discountValue) obj.discountValue = discountValue;
  if (startDate) obj.startDate = startDate;
  if (endDate) obj.endDate = endDate;

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await OfferModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Offer not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", error.message));
  };
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
    const result = await OfferModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Offer not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", err.message));
  }
};

const DeleteOffer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await OfferModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Offer not available"));
    } else {
      return res.status(200).send(SendResponse(true, null, "Offer deleted successfully"));
    };
  } catch (err) {
    return res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
}

module.exports = { AllOffers, CreateOffer, EditOffer, DeleteOffer, UpdateStatus };
