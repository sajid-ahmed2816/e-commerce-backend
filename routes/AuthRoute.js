const express = require("express");
const router = express.Router();
const { Auth, Login, Signup, VerifyOTP, ResendOTP, ValidatePassword, ChangePassword } = require("../controller/UserController");
const verifyToken = require("../middleware/Auth");

router.post("/login/google", Auth);
router.post("/signup", Signup);
router.post("/admin/login", Login);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);
router.post("/resend-otp", ResendOTP);
router.post("/validate-password", verifyToken(["admin"]), ValidatePassword);
router.post("/change-password", verifyToken(["admin"]), ChangePassword);

module.exports = router;