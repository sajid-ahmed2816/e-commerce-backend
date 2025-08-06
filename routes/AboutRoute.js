const express = require("express");
const { Abouts, CreateAbout, EditAbout, DeleteAbout } = require("../controller/AboutController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", Abouts);

router.post("/create", verifyToken(["admin"]), CreateAbout);

router.patch("/update/:id", verifyToken(["admin"]), EditAbout);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteAbout);

module.exports = router;
