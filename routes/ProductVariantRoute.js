const express = require("express");

const {
  CreateProductVariant,
  AllProductVariants,
  GetProductVariant,
  UpdateProductVariant,
  DeleteProductVariant,
  upload
} = require("../controller/ProductVariantController");

const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("", verifyToken(["admin"]), AllProductVariants);
router.get("/:id", verifyToken(["admin"]), GetProductVariant);
router.post("/create", verifyToken(["admin"]), upload.any(), CreateProductVariant);
router.patch("/update/:id", verifyToken(["admin"]), upload.any(), UpdateProductVariant);
router.delete("/delete/:id", verifyToken(["admin"]), DeleteProductVariant);

module.exports = router;