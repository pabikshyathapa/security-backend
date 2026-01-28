const express = require("express");
const router = express.Router();
const orderController = require("../controllers/ordercontroller");
const { authenticate } = require("../middlewares/authorizedUser");

/* USER ROUTES */
router.post("/create", authenticate, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);

/* ESEWA CALLBACK - NO CSRF, NO AUTH */
router.get("/verify-esewa", orderController.verifyEsewaOrder);

/* ADMIN ROUTE */
router.get("/all", authenticate, orderController.getAllOrders);

module.exports = router;


// /* USER */
// router.post("/create", authenticate, orderController.createOrder);
// router.get("/my-orders", authenticate, orderController.getMyOrders);

// router.get("/verify-esewa", orderController.verifyEsewaOrder);

// /* ALL ORDERS (authenticated users only) */
// router.get("/all", authenticate, orderController.getAllOrders);

// module.exports = router;
