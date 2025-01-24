const express = require("express");
const router = express.Router();
const { CreateProduct } = require("../controller/ProductController");

router.post("/create", CreateProduct);

module.exports = router;