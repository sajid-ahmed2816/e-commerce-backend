const express = require("express");
const router = express.Router();
const { AllProducts, CreateProduct, UpdateProduct, DeleteProduct } = require("../controller/ProductController");

router.get("/", AllProducts);
router.post("/create", CreateProduct);
router.patch("/update/:id", UpdateProduct);
router.delete("/delete/:id", DeleteProduct);

module.exports = router;