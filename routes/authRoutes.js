const express = require("express");
const router = express.Router();
const auth = require("../controllers/authcontroller");
const { loginLimiter, registerLimiter } = require("../middlewares/rateLimiter");


router.post("/register",registerLimiter, auth.register);
router.post("/login",loginLimiter, auth.login);
router.post("/verify-mfa", auth.verifyMFA);

module.exports = router;
