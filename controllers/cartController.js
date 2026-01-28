const Cart = require("../models/cart");

exports.addToCart = async (req, res) => {
  try {
    const { productId, name, price, quantity, filepath } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const index = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (index > -1) {
      cart.products[index].quantity += quantity || 1;
    } else {
      cart.products.push({
        productId,
        name,
        price,
        quantity: quantity || 1,
        filepath,
      });
    }

    await cart.save();
    res.status(200).json({ success: true, data: cart.products });
  } catch (error) {
    res.status(500).json({ message: "Add to cart failed" });
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: cart.products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  const item = cart.products.find(
    (p) => p.productId.toString() === productId
  );

  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();

  res.json({ success: true, data: cart.products });
};

/* ================= REMOVE ITEM ================= */
exports.removeCartItem = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  cart.products = cart.products.filter(
    (p) => p.productId.toString() !== productId
  );

  await cart.save();
  res.json({ success: true, data: cart.products });
};

/* ================= CLEAR CART ================= */
exports.clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { products: [] }
  );
  res.json({ success: true, message: "Cart cleared" });
};
