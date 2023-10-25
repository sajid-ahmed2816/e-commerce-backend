const { SendResponse } = require("../helper/SendResponse");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const CreateUser = async (req, res) => {
  const { firstName, lastName, email, password, contact } = req.body;
  const obj = { firstName, lastName, email, password, contact };
  let reqArr = ["firstName", "lastName", "email", "password", "contact"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    res.send(SendResponse(false, null, "Missing Fields", errArr)).status(400);
    return;
  } else {
    let hashPassword = await bcrypt.hash(obj.password, 10);
    obj.password = hashPassword;
  }

  try {
    const result = new UserModel(obj);
    await result.save();
    if (!result) {
      res.send(SendResponse(false, null, "Internal Error")).status(400);
    } else {
      res.send(SendResponse(true, result, "Sign In Successfully")).status(200);
    }
  } catch (error) {
    res.send(error).status(404);
  }
};

const FindUser = async (req, res) => {
  const { email, password } = req.body;
  const obj = { email, password };
  let result = await UserModel.findOne({ email });
  console.log(result);
  if (result) {
    let confirm = await bcrypt.compare(obj.password, result.password);
    if (confirm) {
      let token = jwt.sign({ email }, process.env.SECURE_KEY, {
        expiresIn: "24h",
      });
      res
        .send(SendResponse(true, { user: result, token }, "Login Successfully"))
        .status(200);
    } else {
      res
        .send(SendResponse(true, null, "Invalid email or password"))
        .status(400);
    }
  } else {
    res.send(SendResponse(false, null, "User doesn't exist"));
  }
};

const GetAllUser = async (req, res) => {
  let result = await UserModel.find();
  if (result) {
    res.send(SendResponse(true, result, "All users")).status(200);
  } else {
    res.send(SendResponse(false, null, "No users")).status(400);
  }
};

module.exports = { CreateUser, FindUser, GetAllUser };
