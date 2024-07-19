const express = require("express");
const router = express.Router();
const upload = require("../controller/ImageController");

router.post("/uploads", upload.single("file"), (req, res) => {
  if (req.file) {
    res.json({
      message: "Image upload successfully",
      url: req.file.path,
    })
  } else {
    res.status(400).json({ message: "Image upload failed" });
  }
});

module.exports = router;