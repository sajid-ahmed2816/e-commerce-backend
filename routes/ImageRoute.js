const express = require("express");
const router = express.Router();
const UploadImage = require("../controller/ImageController");

router.post("/uploads", UploadImage);

module.exports = router;