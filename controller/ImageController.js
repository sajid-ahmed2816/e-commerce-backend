const cloudinary = require("../CloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowedFormats: ['jpg', 'png'],
  }
});


const upload = multer({ storage: storage });

const UploadImage = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }
    console.log(req.file);
    if (req.file) {
      res.json({
        message: "Image uploaded successfully",
        url: req.file.path,
        status: true
      });
    } else {
      res.status(400).json({ message: "Image upload failed" });
    }
  });
};

module.exports = UploadImage;