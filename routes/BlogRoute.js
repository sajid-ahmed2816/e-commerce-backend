const express = require("express");
const { Blogs, CreateBlog, EditBlog, DeleteBlog } = require("../controller/BlogController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("/", Blogs);

router.post("/create", verifyToken(["admin"]), CreateBlog);

router.patch("/update/:id", verifyToken(["admin"]), EditBlog);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteBlog);

module.exports = router;
