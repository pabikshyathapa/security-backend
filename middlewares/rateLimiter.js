const rateLimit = require("express-rate-limit");

// Login rate limiter (strict)
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // max login attempts per IP
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register rate limiter (lighter)
exports.registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 40, // max registrations per IP
  message: {
    message: "Too many registration attempts. Please try again later.",
  },
});
