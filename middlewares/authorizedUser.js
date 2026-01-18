// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// exports.authenticate = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Token required" });

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(401).json({ message: "User not found" });

//     req.user = user;
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// exports.isAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Admin access required" });
//   }
//   next();
// };

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ================= AUTHENTICATE USER ================= */
exports.authenticate = async (req, res, next) => {
  try {
    // 🔐 READ TOKEN FROM COOKIE (SECURE SESSION)
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.SECRET);

    // Check if token is about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;
    const tokenExpiry = decoded.exp - now;

    // Optional: Refresh token if it's about to expire
    if (tokenExpiry < 300) { // Less than 5 minutes
      // You can implement token refresh logic here if needed
      console.log("Token expiring soon, consider refreshing");
    }

    // FIND USER
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user's last login is valid (optional: session hijacking protection)
    if (user.lastLogin) {
      const sessionStartTime = new Date(decoded.iat * 1000);
      if (user.lastLogin < sessionStartTime) {
        // Session was created before user's last recorded login - potential hijacking
        return res.status(401).json({ message: "Session invalid" });
      }
    }

    // ATTACH USER TO REQUEST
    req.user = user;
    req.sessionId = decoded.sessionId; // Track session ID
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

/* ================= ADMIN CHECK ================= */
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};