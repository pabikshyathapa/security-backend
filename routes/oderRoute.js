const express = require("express");
const router = express.Router();
const orderController = require("../controllers/ordercontroller");
const { authenticate } = require("../middlewares/authorizedUser");

router.post("/create", authenticate, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);

router.get("/verify-esewa", orderController.verifyEsewaOrder);

router.get("/all", authenticate, orderController.getAllOrders);

module.exports = router;

