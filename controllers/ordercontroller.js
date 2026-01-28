// const Order = require("../models/order");
// const Cart = require("../models/cart");
// const crypto = require("crypto");

// /* =================================================
//    CREATE ORDER (COD + ESEWA)
// ================================================= */
// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { paymentMethod, shippingAddress } = req.body; // ✅ Add shippingAddress

//     if (!paymentMethod) {
//       return res.status(400).json({ message: "Payment method required" });
//     }

//     // ✅ Validate shipping address
//     if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city) {
//       return res.status(400).json({ message: "Complete shipping address required" });
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const totalAmount = cart.products.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );

//     // 1️⃣ Create order with shipping address
//     const order = await Order.create({
//       user: userId,
//       items: cart.products,
//       totalAmount,
//       payment: {
//         method: paymentMethod,
//         status: "pending",
//       },
//       shippingAddress, // ✅ Add this
//     });

//     /* CASH ON DELIVERY */
//     if (paymentMethod === "cod") {
//       order.orderStatus = "confirmed";
//       order.payment.status = "paid"; // ✅ Mark as paid for COD
//       await order.save();

//       cart.products = [];
//       await cart.save();

//       return res.status(201).json({
//         success: true,
//         message: "Order placed (Cash on Delivery)",
//         order,
//       });
//     }

//     /* ESEWA PAYMENT */
//     if (paymentMethod === "esewa") {
//       const amount = Math.round(totalAmount).toString();
//       const transaction_uuid = order._id.toString();
//       const product_code = process.env.ESEWA_PRODUCT_CODE;

//       const dataToSign = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

//       const signature = crypto
//         .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
//         .update(dataToSign)
//         .digest("base64");

//       return res.json({
//         success: true,
//         isEsewa: true,
//         paymentData: {
//           amount,
//           total_amount: amount,
//           transaction_uuid,
//           product_code,
//           success_url: `${process.env.BACKEND_URL}/api/order/verify-esewa`, // ✅ Fixed URL
//           failure_url: `${process.env.FRONTEND_URL}/payment-failed`,
//           signed_field_names: "total_amount,transaction_uuid,product_code",
//           signature,
//           esewa_url: process.env.ESEWA_URL,
//         },
//       });
//     }

//     return res.status(400).json({ message: "Invalid payment method" });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     res.status(500).json({
//       message: "Order creation failed",
//       error: error.message,
//     });
//   }
// };

// /* =================================================
//    VERIFY ESEWA PAYMENT (CALLBACK)
// ================================================= */
// exports.verifyEsewaOrder = async (req, res) => {
//   try {
//     // eSewa sends base64 encoded data
//     const decoded = JSON.parse(
//       Buffer.from(req.query.data, "base64").toString("utf-8")
//     );

//     if (decoded.status !== "COMPLETE") {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/payment-failed`
//       );
//     }

//     const order = await Order.findById(decoded.transaction_uuid);
//     if (!order) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/payment-failed`
//       );
//     }

//     // ✅ Update order
//     order.payment.status = "paid";
//     order.payment.transactionId = decoded.transaction_code;
//     order.orderStatus = "confirmed";
//     await order.save();

//     // ✅ Clear cart AFTER payment success
//     await Cart.findOneAndUpdate(
//       { userId: order.user },
//       { products: [] }
//     );

//     res.redirect(
//       `${process.env.FRONTEND_URL}/payment-success?orderId=${order._id}`
//     );
//   } catch (error) {
//     res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
//   }
// };

// /* =================================================
//    GET MY ORDERS (USER)
// ================================================= */
// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .sort({ createdAt: -1 });

//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch orders",
//       error: error.message,
//     });
//   }
// };

// /* =================================================
//    GET ALL ORDERS (ADMIN)
// ================================================= */
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("user", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch orders",
//       error: error.message,
//     });
//   }
// };
const Order = require("../models/order");
const Cart = require("../models/cart");
const crypto = require("crypto");

/* =================================================
   CREATE ORDER (COD + ESEWA)
================================================= */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod, shippingAddress } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city) {
      return res.status(400).json({ message: "Complete shipping address required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order with shipping address
    const order = await Order.create({
      user: userId,
      items: cart.products,
      totalAmount,
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      shippingAddress,
    });

    /* CASH ON DELIVERY */
    if (paymentMethod === "cod") {
      order.orderStatus = "confirmed";
      order.payment.status = "paid";
      await order.save();

      cart.products = [];
      await cart.save();

      return res.status(201).json({
        success: true,
        message: "Order placed (Cash on Delivery)",
        order,
      });
    }

    /* ESEWA PAYMENT */
    if (paymentMethod === "esewa") {
      const amount = Math.round(totalAmount).toString();
      const tax_amount = "0";
      const total_amount = amount;
      const transaction_uuid = order._id.toString();
      const product_code = process.env.ESEWA_PRODUCT_CODE;
      const product_service_charge = "0";
      const product_delivery_charge = "0";

      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5050}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      const success_url = backendUrl.startsWith('http') 
        ? `${backendUrl}/api/order/verify-esewa`
        : `http://${backendUrl}/api/order/verify-esewa`;

      const failure_url = frontendUrl.startsWith('http')
        ? `${frontendUrl}/payment-failed`
        : `http://${frontendUrl}/payment-failed`;

      const dataToSign = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

      const signature = crypto
        .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
        .update(dataToSign)
        .digest("base64");

      console.log("eSewa Payment Data:", {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        success_url,
        failure_url,
        signature
      });

      return res.json({
        success: true,
        isEsewa: true,
        paymentData: {
          amount,
          tax_amount,
          total_amount,
          transaction_uuid,
          product_code,
          product_service_charge,
          product_delivery_charge,
          success_url,
          failure_url,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature,
          esewa_url: process.env.ESEWA_URL,
        },
      });
    }

    return res.status(400).json({ message: "Invalid payment method" });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};


exports.verifyEsewaOrder = async (req, res) => {
  try {
    console.log("eSewa Callback Query:", req.query);

    // eSewa sends base64 encoded data
    const decoded = JSON.parse(
      Buffer.from(req.query.data, "base64").toString("utf-8")
    );

    console.log("Decoded eSewa Data:", decoded);

    if (decoded.status !== "COMPLETE") {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    const order = await Order.findById(decoded.transaction_uuid);
    if (!order) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Update order
    order.payment.status = "paid";
    order.payment.transactionId = decoded.transaction_code;
    order.orderStatus = "confirmed";
    await order.save();

    await Cart.findOneAndUpdate(
      { userId: order.user },
      { products: [] }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/payment-success?orderId=${order._id}`);
  } catch (error) {
    console.error("eSewa verification error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/payment-failed`);
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};