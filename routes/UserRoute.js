const express = require("express");
const router = express.Router();
const { Users } = require("../controller/UserController");

router.get("/", Users);

module.exports = router;