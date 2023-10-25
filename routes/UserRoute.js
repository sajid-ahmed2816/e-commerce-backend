const express = require("express");
const route = express.Router();
const {
  CreateUser,
  FindUser,
  GetAllUser,
} = require("../controller/UserController");

route.post("/signup", CreateUser);

route.get("/login", FindUser);

route.get("/users", GetAllUser);

module.exports = route;
