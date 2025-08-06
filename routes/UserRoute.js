const express = require("express");
const router = express.Router();
const { Auth } = require("../controller/UserController");

router.post("/auth", Auth);

module.exports = router;