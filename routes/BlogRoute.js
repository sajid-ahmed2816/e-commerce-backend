const express = require("express");
const { Blogs, CreateBlog, EditBlog, DeleteBlog, UpdateStatus } = require("../controller/BlogController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("", Blogs);

router.post("/create", verifyToken(["admin"]), CreateBlog);

router.patch("/update/:id", verifyToken(["admin"]), EditBlog);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteBlog);

router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);

module.exports = router;
