const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.get("/all", cartController.getAllCartItems);
router.get("/:userId", cartController.getCartByUser);
router.put("/update", cartController.updateCartItem);
router.delete("/remove", cartController.removeCartItem);
router.delete("/clear/:userId", cartController.clearCart);
router.delete("/clear-all", cartController.clearAllCarts);



module.exports = router;
