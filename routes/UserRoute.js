const express = require("express");
const router = express.Router();
const { Auth, Login, Signup } = require("../controller/UserController");

router.post("/login/google", Auth);
router.post("/signup", Signup);
router.post("/admin/login", Login);
router.post("/login", Login);

module.exports = router;