const express = require("express");
const verifyToken = require("../middleware/Auth");
const {
  AllAttributeValues,
  CreateAttributeValue,
  EditAttributeValue,
  UpdateStatus,
  DeleteAttributeValue
} = require("../controller/AttributeValueController");

const router = express.Router();

router.get("", verifyToken(["admin"]), AllAttributeValues);
router.post("/create", verifyToken(["admin"]), CreateAttributeValue);
router.patch("/update/:id", verifyToken(["admin"]), EditAttributeValue);
router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);
router.delete("/delete/:id", verifyToken(["admin"]), DeleteAttributeValue);

module.exports = router;