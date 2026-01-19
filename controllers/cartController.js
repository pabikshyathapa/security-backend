// // const Cart = require("../models/cart");

// // // Add product to cart
// // exports.addToCart = async (req, res) => {
// //   const { userId, productId, name, price, quantity, filepath } = req.body;

// //   try {
// //     let cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       cart = new Cart({
// //         userId,
// //         products: [{ productId, name, price, quantity, filepath }]
// //       });
// //     } else {
// //       const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
// //       if (productIndex > -1) {
// //         cart.products[productIndex].quantity += quantity;
// //       } else {
// //         cart.products.push({ productId, name, price, quantity, filepath });
// //       }
// //     }

// //     await cart.save();
// //     return res.status(201).json({ success: true, message: "Product added to cart", data: cart });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };

// // // Get cart by userId
// // exports.getCartByUser = async (req, res) => {
// //   try {
// //     console.log("Incoming request:", req.params.userId); // ✅ log userId

// //     const cart = await Cart.findOne({ userId: req.params.userId });
// //     console.log("Fetched cart:", cart); 

// //     if (!cart) {
// //       return res.status(404).json({ success: false, message: "Cart not found" });
// //     }

// //     return res.json({ success: true, data: cart, message: "Cart fetched" });

// //   } catch (err) {
// //     console.error("Error fetching cart:", err); 
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };

// // // Update quantity of a cart item
// // exports.updateCartItem = async (req, res) => {
// //   const { userId, productId, quantity } = req.body;
// //   try {
// //     const cart = await Cart.findOne({ userId });
// //     if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

// //     const product = cart.products.find(p => p.productId.toString() === productId);
// //     if (!product) return res.status(404).json({ success: false, message: "Product not in cart" });

// //     product.quantity = quantity;
// //     await cart.save();

// //     return res.json({ success: true, message: "Quantity updated", data: cart });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };

// // // Remove a product from cart
// // exports.removeCartItem = async (req, res) => {
// //   const { userId, productId } = req.body;
// //   try {
// //     const cart = await Cart.findOne({ userId });
// //     if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

// //     cart.products = cart.products.filter(p => p.productId.toString() !== productId);
// //     await cart.save();

// //     return res.json({ success: true, message: "Product removed", data: cart });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };

// // // Clear entire cart
// // exports.clearCart = async (req, res) => {
// //   try {
// //     await Cart.findOneAndDelete({ userId: req.params.userId });
// //     return res.json({ success: true, message: "Cart cleared" });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };
// // exports.getAllCartItems = async (req, res) => {
// //   try {
// //     const carts = await Cart.find(); // get all carts
// //     const allProducts = carts.flatMap(cart => cart.products); // combine all products
// //     return res.json({ success: true, data: allProducts });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };
// // // controllers/cartController.js

// // exports.clearAllCarts = async (req, res) => {
// //   try {
// //     // Remove all cart documents from the collection
// //     await Cart.deleteMany({});

// //     return res.json({ success: true, message: "All cart data cleared successfully." });
// //   } catch (error) {
// //     console.error("Error clearing all carts:", error);
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };


// const Cart = require("../models/cart");
// const Product = require("../models/Product");

// /* ================= ADD TO CART ================= */
// exports.addToCart = async (req, res) => {
//   try {
//     const { userId, productId, name, price, quantity, filepath } = req.body;

//     if (!userId || !productId) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // ✅ Find existing cart for user
//     let cart = await Cart.findOne({ userId });

//     // ✅ If cart doesn't exist, create one
//     if (!cart) {
//       cart = new Cart({
//         userId,
//         products: [],
//       });
//     }

//     // ✅ Check if product already exists
//     const productIndex = cart.products.findIndex(
//       (p) => p.productId.toString() === productId
//     );

//     if (productIndex > -1) {
//       // ✅ Increase quantity if already exists
//       cart.products[productIndex].quantity += quantity || 1;
//     } else {
//       // ✅ Push product into cart
//       cart.products.push({
//         productId,
//         name,
//         price,
//         quantity: quantity || 1,
//         filepath,
//       });
//     }

//     await cart.save();

//     res.status(200).json(cart);
//   } catch (error) {
//     console.error("Add to cart error:", error);
//     res.status(500).json({ message: "Failed to add to cart" });
//   }
// };

// /* ================= GET USER CART ================= */
// exports.getAllCartItems = async (req, res) => {
//   try {
//     const items = await Cart.find({ userId: req.user._id });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch cart" });
//   }
// };

// /* ================= UPDATE QUANTITY ================= */
// exports.updateCartItem = async (req, res) => {
//   const { productId, quantity } = req.body;

//   const item = await Cart.findOneAndUpdate(
//     { userId: req.user._id, productId },
//     { quantity },
//     { new: true }
//   );

//   res.json(item);
// };

// /* ================= REMOVE ITEM ================= */
// exports.removeCartItem = async (req, res) => {
//   const { productId } = req.body;

//   await Cart.findOneAndDelete({
//     userId: req.user._id,
//     productId,
//   });

//   res.json({ message: "Item removed" });
// };

// /* ================= CLEAR CART ================= */
// exports.clearCart = async (req, res) => {
//   await Cart.deleteMany({ userId: req.user._id });
//   res.json({ message: "Cart cleared" });
// };

const Cart = require("../models/cart");

/* ================= ADD TO CART ================= */
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

/* ================= GET MY CART ================= */
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

/* ================= UPDATE QUANTITY ================= */
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
