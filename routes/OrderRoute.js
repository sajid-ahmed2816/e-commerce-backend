const express = require("express");
const { getAllOrders, getOrderDetailById, CreateOrder, EditOrder, DeleteOrder } = require("../controller/OrderController");
const verifyToken = require("../middleware/Auth");

const router = express.Router();

router.get("", verifyToken(["admin", "user"]), getAllOrders);

router.get("/order-detail/:id", verifyToken(["admin", "user"]), getOrderDetailById);

router.post("/create", verifyToken(["admin", "user"]), CreateOrder);

router.patch("/update/:id", verifyToken(["admin"]), EditOrder);

router.delete("/delete/:id", verifyToken(["admin"]), DeleteOrder);

module.exports = router;
