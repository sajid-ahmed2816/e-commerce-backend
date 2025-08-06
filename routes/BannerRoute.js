const express = require("express");
const { Banners, CreateBanner, EditBanner, DeleteBanner } = require("../controller/BannerController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", Banners);

router.post("/create", verifyToken(["admin"]), CreateBanner);

router.patch("/update/:id", verifyToken(["admin"]), EditBanner);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteBanner);

module.exports = router;
