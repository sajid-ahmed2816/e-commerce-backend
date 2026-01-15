const express = require("express");
const router = express.Router();
const { Auth, Login, Signup, VerifyOTP, ResendOTP } = require("../controller/UserController");

router.post("/login/google", Auth);
router.post("/signup", Signup);
router.post("/admin/login", Login);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);
router.post("/resend-otp", ResendOTP);

module.exports = router;