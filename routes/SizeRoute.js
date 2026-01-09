const express = require("express");
const { AllSizes, CreateSize, EditSize, DeleteSize } = require("../controller/SizeController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", AllSizes);

router.post("/create", verifyToken(["admin"]), CreateSize);

router.patch("/update/:id", verifyToken(["admin"]), EditSize);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteSize);

module.exports = router;
