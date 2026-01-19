const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        filepath: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    payment: {
      method: {
        type: String,
        enum: ["cod", "esewa"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      transactionId: String,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "shipped", "delivered"],
      default: "pending",
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      landmark: { type: String }, // optional
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
