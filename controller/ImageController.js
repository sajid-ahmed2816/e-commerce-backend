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


module.exports = upload;