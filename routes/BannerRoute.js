const express = require("express");
const { Banners, CreateBanner, EditBanner, DeleteBanner, UpdateStatus } = require("../controller/BannerController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", Banners);

router.post("/create", verifyToken(["admin"]), CreateBanner);

router.patch("/update/:id", verifyToken(["admin"]), EditBanner);

router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteBanner);

module.exports = router;
