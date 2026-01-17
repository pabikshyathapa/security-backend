const Cart = require("../models/cart");
const Order = require("../models/order");

exports.checkoutCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalAmount = cart.products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );

    const newOrder = new Order({
      userId,
      products: cart.products,
      totalAmount,
    });

    await newOrder.save();

    // Clear cart after checkout
    cart.products = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Checkout successful. Order placed.",
      data: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // latest first

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this user" });
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
