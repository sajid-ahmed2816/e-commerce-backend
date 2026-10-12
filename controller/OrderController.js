const webpush = require('web-push');
const mongoose = require("mongoose");
const Paginate = require("../helper/Paginate");
const { SendResponse } = require("../helper/SendResponse");
const CategoryModel = require("../models/CategoryModel");
const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const userModel = require("../models/UserModel");
const { SendOCEmail } = require("../helper/SendEmail");
const SubscriptionModel = require('../models/SubscriptionModel');
const NotificationModel = require('../models/NotificationModel');
const ProductVariantModel = require("../models/ProductVariantModel");

webpush.setVapidDetails(
  'mailto:sajid.ahmed2816@gmail.com',
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
);

const orderEmailTemplate = (order) => {
  return `
    <div style="font-family: Arial; line-height: 1.6">
      <h2>Thank you for your order, ${order.firstName}!</h2>

      <p>Your order has been placed successfully.</p>

      <h3>Order Details</h3>
      <p><strong>Order ID:</strong> ${order.orderNo}</p>
      <p><strong>Total:</strong> Rs ${order.total}</p>

      <h3>Items:</h3>
      <ul>
        ${order.items
      .map(
        (item) =>
          `<li>${item.product.name} × ${item.quantity}</li>`
      )
      .join("")}
      </ul>

      <p>We’ll notify you once your order is shipped.</p>

      <br/>
      <p>— Fashion Store Team</p>
    </div>
  `;
};

const getAllOrders = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category, product, user } = req.query;

    let query = {};

    if (user) {
      query.user = user;
    }

    if (search) {
      let categoryIds = [];
      let productIds = [];
      let userIds = [];

      if (!category) {
        const categories = await CategoryModel.find({
          name: { $regex: search, $options: "i" }
        }).select("_id");
        categoryIds = categories.map(c => c._id);
      }

      if (!product) {
        const products = await ProductModel.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : [])
          ]
        }).select("_id");
        productIds = products.map(p => p._id);
      }

      const users = await userModel.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      userIds = users.map(u => u._id);

      const orConditions = [
        { orderNo: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        ...(productIds.length > 0 ? [{ "items.product": { $in: productIds } }] : []),
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : [])
      ];
      query.$or = orConditions;
    }

    if (category) {
      const productIdsInCategory = await ProductModel.find({ category }).select("_id");
      const prodIds = productIdsInCategory.map(p => p._id);
      query["items.product"] = { $in: prodIds };
    }

    if (product) {
      query["items.product"] = product;
    }

    // Use paginate helper
    const result = await Paginate({
      model: OrderModel,
      query,
      page,
      limit,
      populate: [],
      sort: { createdAt: -1 } // latest first
    });

    if (result) {
      const ordersFormatted = result.data.map(order => ({
        _id: order._id,
        orderNo: order.orderNo,
        customerName: `${order.firstName} ${order.lastName}`,
        mobile: order.mobile,
        productCount: order.items.length,
        total: order.total,
        paymentMethod: order.paymentMethod,
        country: order.country,
        state: order.state,
        city: order.city,
        createdAt: order.createdAt,
        status: order.status
      }));

      return res.status(200).send(SendResponse(
        true,
        {
          orders: ordersFormatted,
          pagination: result.pagination,
        },
        "All Orders"
      ));
    }
  } catch (err) {
    console.log("🚀 ~ getAllOrders ~ err:", err);
    res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

const getOrderDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send(SendResponse(false, null, "Order ID is required"));
    };

    const order = await OrderModel.findById(id).populate({
      path: "items.product",
      select: "name image category"
    }).populate({
      path: "items.variant",
      select: "sku price attributes image",
      populate: [
        {
          path: "attributes.attribute",
          select: "name"
        },
        {
          path: "attributes.value",
          select: "value"
        }
      ]
    });

    if (!order) {
      return res.status(404).send(SendResponse(false, null, "Order not found"));
    };

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderDetail = {
      _id: order._id,
      orderNo: order.orderNo,
      customer: {
        name: `${order.firstName} ${order.lastName}`,
        email: order.email,
        mobile: order.mobile,
        billingAddress: order.billingAddress,
        orderDate: order.createdAt,
      },
      summary: {
        subtotal: subtotal,
        deliveryCharge: order.dc,
        total: order.total,
        orderId: order._id,
      },
      items: order.items.map(item => ({
        product: item.product ? {
          id: item.product._id,
          name: item.product.name,
          image: item.product.image,
        } : null,
        variant: item.variant ? {
          id: item.variant._id,
          sku: item.sku || item.variant.sku,
          price: item.price,
          image: item.variant.image,
          attributes: item.variant.attributes.map((attribute) => ({
            attribute: attribute.attribute?.name,
            value: attribute.value?.value,
          })),
        } : null,
        sku: item.sku,
        quantity: item.quantity,
        priceEach: item.price,
        total: item.price * item.quantity,
      })),
      status: order.status,
      shippingAddress: order.shippingAddress,
      city: order.city,
      state: order.state,
      zip: order.zip,
    };

    return res.status(200).send(SendResponse(true, { order: orderDetail }, "Order details fetched"));
  } catch (err) {
    res.status(500).send(SendResponse(false, null, "Internal server error"));
  };
};

const CreateOrder = async (req, res) => {
  let {
    user,
    firstName,
    lastName,
    email,
    items,
    mobile,
    billingAddress,
    shippingAddress,
    country,
    city,
    state,
    zip,
    paymentMethod,
    dc,
    total
  } = req.body;

  let reqArr = [
    "user",
    "firstName",
    "lastName",
    "email",
    "items",
    "mobile",
    "billingAddress",
    "country",
    "city",
    "state",
    "paymentMethod",
    "dc",
    "total"
  ];

  let obj = {
    user,
    firstName,
    lastName,
    email,
    items,
    mobile,
    billingAddress,
    shippingAddress,
    country,
    city,
    state,
    zip,
    paymentMethod,
    dc,
    total
  };

  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    return res.status(400).send(SendResponse(false, null, "Required all data"));
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send(SendResponse(false, null, "Order items required"));
  };

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const orderItems = [];

    for (const item of items) {
      const {
        product,
        variant,
        quantity
      } = item;

      // Product required
      if (!product) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, "Product is required"));
      };

      // Variant required
      if (!variant) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, "Variant is required for every order item"));
      };

      // Quantity validation
      if (!Number.isInteger(quantity) || quantity < 1) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, "Quantity must be at least 1"));
      };

      // Check product
      const productData = await ProductModel.findById(product).session(session);

      if (!productData) {
        await session.abortTransaction();
        return res.status(404).send(SendResponse(false, null, `Product not found: ${product}`));
      };

      // Check variant
      const variantData = await ProductVariantModel.findById(variant).session(session);

      if (!variantData) {
        await session.abortTransaction();
        return res.status(404).send(SendResponse(false, null, `Variant not found: ${variant}`));
      };

      // Variant must belong to the same product
      if (variantData.product.toString() !== productData._id.toString()) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, "Variant does not belong to the selected product"));
      };

      // Variant must be active
      if (!variantData.isActive) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, `Variant ${variantData.sku} is not available`));
      };

      // Order item snapshot
      orderItems.push({
        product: productData._id,
        variant: variantData._id,
        sku: variantData.sku,
        quantity,
        price: variantData.price
      });
    }

    // Calculate subtotal from DB prices
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = Number(dc) || 0;
    const calculatedTotal = subtotal + deliveryCharge;

    // Update total from trusted DB values
    obj.items = orderItems;
    obj.dc = deliveryCharge;
    obj.total = calculatedTotal;

    // Deduct stock
    for (const item of orderItems) {
      const updatedVariant = await ProductVariantModel.findOneAndUpdate(
        {
          _id: item.variant,
          isActive: true,
          stock: { $gte: item.quantity }
        },
        {
          $inc: {
            stock: -item.quantity
          }
        },
        { new: true, session }
      );

      if (!updatedVariant) {
        await session.abortTransaction();
        return res.status(400).send(SendResponse(false, null, `Insufficient stock for ${item.sku}`));
      }
    };

    // Create order
    const result = new OrderModel(obj);

    await result.save({ session });

    if (!result) {
      await session.abortTransaction();
      return res.status(400).send(SendResponse(false, null, "Internal error"));
    };

    await session.commitTransaction();

    // Populate order
    const populatedOrder = await OrderModel.findById(result._id).populate("items.product").populate("items.variant");

    // Create notification
    const notification = new NotificationModel({
      orderId: result._id,
      orderNo: result.orderNo,
      message: `New order #${result.orderNo} placed by ${firstName} ${lastName}`,
    });

    await notification.save();

    const io = req.app.get("io");

    io.emit("new-notification", notification);

    io.emit("new-order", {
      message: "New order received"
    });

    // Push notifications
    const subscriptions = await SubscriptionModel.find();

    const payload = JSON.stringify({
      title: "New Order",
      body: `Order #${result.orderNo} has been placed!`,
      icon: "/logo192.png",
    });

    const notifications = subscriptions.map((sub) => webpush.sendNotification(sub, payload)
      .catch((err) => {
        // Remove expired subscription
        if (err.statusCode === 410) {
          SubscriptionModel.deleteOne({
            endpoint: sub.endpoint
          }).exec();
        }
      })
    );

    await Promise.allSettled(notifications);

    // Order confirmation email
    await SendOCEmail({
      to: email,
      subject: "Order Confirmation - Fashion Store",
      html: orderEmailTemplate(populatedOrder),
    });

    return res.status(200).send(SendResponse(true, result, "Order Placed Successfully"));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return res.status(500).send(SendResponse(false, null, "Internal Server Error"));
  };
};

const EditOrder = async (req, res) => {
  let { id } = req.params;
  let { user, product, mobile, billingAddress, country, city, state, paymentMethod, dc, total } = req.body;
  let obj = {
    ...(user && { user }),
    ...(product && { product }),
    ...(mobile && { mobile }),
    ...(billingAddress && { billingAddress }),
    ...(country && { country }),
    ...(city && { city }),
    ...(state && { state }),
    ...(paymentMethod && { paymentMethod }),
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

module.exports = { getAllOrders, getOrderDetailById, CreateOrder, EditOrder, DeleteOrder };
