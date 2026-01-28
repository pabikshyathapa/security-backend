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

router.get("/csrf-token", csrfProtection, authController.getCsrfToken);

router.post("/register", csrfProtection, authController.register);

router.post("/login", csrfProtection, authController.login);


router.post("/verify-mfa", csrfProtection, authController.verifyMFA);


router.post("/logout", authController.logout);


module.exports = router;