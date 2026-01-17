const Cart = require("../models/cart");

// Add product to cart
exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, quantity, filepath } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, name, price, quantity, filepath }]
      });
    } else {
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, name, price, quantity, filepath });
      }
    }

    await cart.save();
    return res.status(201).json({ success: true, message: "Product added to cart", data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get cart by userId
exports.getCartByUser = async (req, res) => {
  try {
    console.log("Incoming request:", req.params.userId); // ✅ log userId

    const cart = await Cart.findOne({ userId: req.params.userId });
    console.log("Fetched cart:", cart); 

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    return res.json({ success: true, data: cart, message: "Cart fetched" });

  } catch (err) {
    console.error("Error fetching cart:", err); 
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update quantity of a cart item
exports.updateCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const product = cart.products.find(p => p.productId.toString() === productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not in cart" });

    product.quantity = quantity;
    await cart.save();

    return res.json({ success: true, message: "Quantity updated", data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Remove a product from cart
exports.removeCartItem = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    return res.json({ success: true, message: "Product removed", data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    return res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.getAllCartItems = async (req, res) => {
  try {
    const carts = await Cart.find(); // get all carts
    const allProducts = carts.flatMap(cart => cart.products); // combine all products
    return res.json({ success: true, data: allProducts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
// controllers/cartController.js

exports.clearAllCarts = async (req, res) => {
  try {
    // Remove all cart documents from the collection
    await Cart.deleteMany({});

    return res.json({ success: true, message: "All cart data cleared successfully." });
  } catch (error) {
    console.error("Error clearing all carts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


