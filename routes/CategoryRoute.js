const express = require("express");
const router = express.Router();
const { AllCategories, CreateCategory, EditCategory, DeleteCategory } = require("../controller/CategoryController");

router.get("/", AllCategories);

router.post("/create", CreateCategory);

router.patch("/update/:id", EditCategory);

router.delete("/delete/:id", DeleteCategory);

module.exports = router;
