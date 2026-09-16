const express = require("express");
const verifyToken = require("../middleware/Auth");
const {
  AllAttributes,
  CreateAttribute,
  EditAttribute,
  UpdateStatus,
  DeleteAttribute
} = require("../controller/AttributeController");

const router = express.Router();

router.get("", verifyToken(["admin"]), AllAttributes);
router.post("/create", verifyToken(["admin"]), CreateAttribute);
router.patch("/update/:id", verifyToken(["admin"]), EditAttribute);
router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);
router.delete("/delete/:id", verifyToken(["admin"]), DeleteAttribute);

module.exports = router;