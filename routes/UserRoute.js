const express = require("express");
const route = express.Router();
const { SendResponse } = require("../helper/SendResponse");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");

route.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const obj = { email, password };
  let reqArr = ["email", "password"];
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
});

module.exports = route;
