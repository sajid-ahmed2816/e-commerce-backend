const express = require("express");
const { AllOffers, CreateOffer, EditOffer, DeleteOffer, UpdateStatus } = require("../controller/OfferController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("", AllOffers);

router.post("/create", verifyToken(["admin"]), CreateOffer);

router.patch("/update/:id", verifyToken(["admin"]), EditOffer);

router.patch("/updateStatus/:id", verifyToken(["admin"]), UpdateStatus);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteOffer);

module.exports = router;
