const Paginate = require("../helper/Paginate");
const { SendResponse } = require("../helper/SendResponse");
const CategoryModel = require("../models/CategoryModel");
const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const userModel = require("../models/UserModel");

const Orders = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category, product } = req.query;
    let query = {};
    if (search) {
      let categoryIds = [];
      let productIds = [];
      let userIds = [];
      if (!category) {
        const categories = await CategoryModel.find({
          name: { $regex: search, $options: "i" }
        }).select("_id");
        categoryIds = categories.map(c => c._id);
      };
      if (!product) {
        const products = await ProductModel.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            ...(categoryIds.length > 0) ? [{ category: { $in: categoryIds } }] : []
          ]
        }).select("_id");
        productIds = products.map(p => p._id);
      };
      const users = await userModel.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      userIds = users.map(u => u._id);
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        ...(productIds.length > 0) ? [{ "items.product": { $in: productIds } }] : [],
        ...(userIds.length > 0) ? [{ user: { $in: userIds } }] : [],
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    };
    if (category) {
      query.category = category;
    };
    if (product) {
      query.product = product;
    };
    let result = await Paginate({
      model: OrderModel,
      query,
      page,
      limit,
      populate: [
        { path: "user" },
        { path: "items.product", populate: "category" }]
    })
    if (result) {
      return res.status(200).send(SendResponse(
        true,
        {
          orders: result.data,
          pagination: result.pagination,
        },
        "All Orders"
      ));
    }
  } catch (err) {
    console.log("🚀 ~ Orders ~ err:", err)
    res.status(500).send(SendResponse(null, null, "Internal server error"));
  }
};

const CreateOrder = async (req, res) => {
  let { user, firstName, lastName, email, items, mobile, billingAddress, city, state, dc, total } = req.body;
  let obj = { user, firstName, lastName, email, items, mobile, billingAddress, city, state, dc, total };
  let reqArr = ["user", "firstName", "lastName", "email", "items", "mobile", "billingAddress", "city", "state", "dc", "total"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    return res.status(400).send(SendResponse(false, null, `Required all data`));
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .send(SendResponse(false, null, "Order items required"));
  }

  try {
    const result = new OrderModel(obj);
    await result.save();
    if (!result) {
      res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      res.status(200).send(SendResponse(true, result, "Order Placed Successfully"));
    };
  } catch (error) {
    console.log(error);
    return res.status(500).send(SendResponse(false, null, "Internal Server Error"))
  };
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
};

module.exports = { Orders, CreateOrder, EditOrder, DeleteOrder };
