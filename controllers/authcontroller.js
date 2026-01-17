const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { validatePasswordStrength } = require("../utils/policypassword");
const { isAccountLocked, registerFailedAttempt, resetLoginAttempts } =
  require("../utils/accountLock");
const { generateOTP } = require("../utils/mfa");
const { verifyCaptcha } = require("../utils/verifycaptcha");


exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = new User({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashed,
    passwordHistory: [{ password: hashed, changedAt: new Date() }],
    passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  });

  await user.save();

  res.status(201).json({ message: "Registered successfully" });
};

/* ================= LOGIN STEP 1 ================= */
exports.login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Account lock check
    if (isAccountLocked(user)) {
      return res.status(423).json({
        message: "Account locked. Try again later.",
      });
    }

    // Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Increment loginAttempts
      await registerFailedAttempt(user);

      // If loginAttempts now >= 2, require CAPTCHA next time
      const requireCaptcha = user.loginAttempts + 1 >= 2;

      return res.status(401).json({
        message: "Invalid credentials",
        captchaRequired: requireCaptcha,
      });
    }

    // CAPTCHA check (only if attempts >= 2)
    if (user.loginAttempts >= 2) {
      if (!captchaToken) {
        return res.status(403).json({
          message: "Please complete CAPTCHA to continue",
          captchaRequired: true,
        });
      }

      const isHuman = await verifyCaptcha(captchaToken);
      if (!isHuman) {
        return res.status(403).json({
          message: "CAPTCHA verification failed",
          captchaRequired: true,
        });
      }
    }

    // Reset login attempts on success
    await resetLoginAttempts(user);

    // Password expiry check
    if (user.passwordExpiresAt && user.passwordExpiresAt < Date.now()) {
      return res.status(403).json({
        message: "Your password has expired. Please reset your password.",
      });
    }

    // Generate MFA OTP
    const otp = generateOTP();
    user.mfaOTP = otp;
    user.mfaOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // For coursework: log OTP to console
    console.log("MFA OTP:", otp);

    // Respond to client
    res.json({ message: "OTP sent to registered email" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= LOGIN STEP 2 (MFA VERIFY) ================= */
exports.verifyMFA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.mfaOTP !== otp || !user.mfaOTPExpires || user.mfaOTPExpires < Date.now()) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.mfaOTP = undefined;
    user.mfaOTPExpires = undefined;
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    // Return both user and token
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("verifyMFA error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
