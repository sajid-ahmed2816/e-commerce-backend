const express = require("express");
const verifyToken = require("../middleware/Auth");
const { AllProducts, CreateProduct, UpdateProduct, DeleteProduct } = require("../controller/ProductController");

const router = express.Router();

router.get("/", AllProducts);
router.post("/create", verifyToken(["admin"]), CreateProduct);
router.patch("/update/:id", verifyToken(["admin"]), UpdateProduct);
router.delete("/delete/:id", verifyToken(["admin"]), DeleteProduct);

module.exports = router;