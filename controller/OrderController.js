const { SendResponse } = require("../helper/SendResponse");
const OrderModel = require("../models/OrderModel");

const Orders = async (req, res) => {
  try {
    let result = await OrderModel.find();
    if (result) {
      res.send(SendResponse(true, { orders: result }, "All Orders")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(null, null, "Internal server error").status(500));
  }
};

const CreateOrder = async (req, res) => {
  let { user, product, mobile, billingAddress, city, state, dc, total } = req.body;
  let obj = { user, product, mobile, billingAddress, city, state, dc, total };
  let reqArr = ["user", "product", "mobile", "billingAddress", "city", "state", "dc", "total"];
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
    const result = new OrderModel(obj);
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

const EditOrder = async (req, res) => {
  let { id } = req.params;
  let { user, product, mobile, billingAddress, city, state, dc, total } = req.body;
  let obj = {
    ...(user && { user }),
    ...(product && { product }),
    ...(mobile && { mobile }),
    ...(billingAddress && { billingAddress }),
    ...(city && { city }),
    ...(state && { state }),
    ...(dc && { dc }),
    ...(total && { total }),
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await OrderModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Order not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await OrderModel.findOneAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "Order not found")).status(404);
    } else {
      res.send(SendResponse(true, null, "Deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { Orders, CreateOrder, EditOrder, DeleteOrder };
