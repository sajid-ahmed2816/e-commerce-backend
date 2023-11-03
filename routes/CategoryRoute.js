const express = require("express");
const route = express.Router();
const CreateCategory = require("../controller/CategoryController");

route.post("/category", CreateCategory);

module.exports = route;
