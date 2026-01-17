const express = require("express");
const router = express.Router();
const orderController=require('../controllers/ordercontroller')

router.post("/checkout",orderController.checkoutCart);
router.get("/:userId", orderController.getOrdersByUser);


module.exports = router;
