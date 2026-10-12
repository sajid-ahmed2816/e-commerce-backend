const express = require("express");
const verifyToken = require("../middleware/Auth");
const {
  AllProducts,
  GetProductById,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  UpdateStatus,
  BulkUploadProducts,
  thumbnailUpload,
  excelUpload
} = require("../controller/ProductController");

const router = express.Router();

router.get("", AllProducts);
router.get("/:id", GetProductById);
router.post("/create", verifyToken(["admin"]), thumbnailUpload.single("thumbnail"), CreateProduct);
router.post("/bulk-upload", excelUpload.single("file"), BulkUploadProducts);
router.patch("/update/:id", verifyToken(["admin"]), thumbnailUpload.single("thumbnail"), UpdateProduct);
router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);
router.delete("/delete/:id", verifyToken(["admin"]), DeleteProduct);

module.exports = router;