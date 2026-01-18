// const express = require("express");
// const router = express.Router();
// const auth = require("../controllers/authcontroller");
// const { loginLimiter, registerLimiter } = require("../middlewares/rateLimiter");


// router.post("/register",registerLimiter, auth.register);
// router.post("/login",loginLimiter, auth.login);
// router.post("/verify-mfa", auth.verifyMFA);

// module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");
const csrf = require("csurf");

// CSRF protection for specific routes
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
});

// GET CSRF token (needs CSRF middleware to generate token)
router.get("/csrf-token", csrfProtection, authController.getCsrfToken);

// Register - with CSRF protection
router.post("/register", csrfProtection, authController.register);

// Login Step 1 - with CSRF protection
router.post("/login", csrfProtection, authController.login);

// MFA Verify Step 2 - with CSRF protection
router.post("/verify-mfa", csrfProtection, authController.verifyMFA);

// Logout
router.post("/logout", authController.logout);

module.exports = router;