// routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { Search } = require("../controller/SearchController");

// GET /api/search?q=keyword&page=1&limit=10
router.get("/search", Search);

module.exports = router;