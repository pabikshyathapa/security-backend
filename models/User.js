const mongoose = require("mongoose");

const passwordHistorySchema = new mongoose.Schema({
  password: String,
  changedAt: Date,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    password: { type: String, required: true },

    passwordHistory: [passwordHistorySchema],

    passwordExpiresAt: Date,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaOTP: String,
    mfaOTPExpires: Date,

    // Brute-force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // Profile image
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
