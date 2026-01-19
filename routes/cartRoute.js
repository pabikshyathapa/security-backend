const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/authorizedUser");

router.post("/add", authenticate, cartController.addToCart);
router.get("/my-cart", authenticate, cartController.getMyCart);
router.put("/update", authenticate, cartController.updateCartItem);
router.delete("/remove", authenticate, cartController.removeCartItem);
router.delete("/clear", authenticate, cartController.clearCart);

module.exports = router;
