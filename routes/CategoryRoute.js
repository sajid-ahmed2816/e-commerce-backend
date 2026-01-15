const express = require("express");
const { AllCategories, CreateCategory, EditCategory, DeleteCategory, UpdateStatus } = require("../controller/CategoryController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", AllCategories);

router.post("/create", verifyToken(["admin"]), CreateCategory);

router.patch("/update/:id", verifyToken(["admin"]), EditCategory);

router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteCategory);

module.exports = router;
