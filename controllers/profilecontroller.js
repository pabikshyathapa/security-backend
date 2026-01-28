const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const ActivityLog = require("../models/Activitylog");
const { validatePasswordStrength } = require("../utils/policypassword");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -passwordHistory -mfaOTP -mfaOTPExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    let emailChanged = false;

    if (email && email.toLowerCase() !== req.user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }

      req.user.email = email.toLowerCase();
      emailChanged = true;
    }

    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;

    await req.user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: emailChanged
        ? "Profile updated (email change)"
        : "Profile updated (name/phone)",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    if (emailChanged) {
      return res.status(200).json({
        message:
          "Email updated successfully. Please login again for security reasons.",
        logout: true,
      });
    }

    res.json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user.id).select("+password +passwordHistory");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    for (const entry of user.passwordHistory) {
      const reused = await bcrypt.compare(newPassword, entry.password);
      if (reused) {
        return res.status(400).json({
          message: "Cannot reuse previous passwords",
        });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    user.password = hashed;
    user.passwordHistory.push({
      password: hashed,
      changedAt: new Date(),
    });

    user.passwordExpiresAt = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    );

    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: "Password changed",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.user.profileImage) {
      const oldImagePath = path.join(__dirname, "..", req.user.profileImage);

      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting old profile image:", err);
        }
      });
    }

    req.user.profileImage = `/uploads/profile/${req.file.filename}`;
    await req.user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: "Profile image updated",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      message: "Profile image updated successfully",
      profileImage: req.user.profileImage,
    });
  } catch (err) {
    console.error("Update profile image error:", err);
    res.status(500).json({ message: "Server error" });
  }
};