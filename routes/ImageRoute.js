const express = require("express");
const UploadImage = require("../controller/ImageController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.post("/uploads", verifyToken(["admin"]), UploadImage);

module.exports = router;