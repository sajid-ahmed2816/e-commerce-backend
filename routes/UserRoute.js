const express = require("express");
const router = express.Router();
const { Auth, Login } = require("../controller/UserController");

router.post("/auth", Auth);
router.post("/admin/login", Login);

module.exports = router;