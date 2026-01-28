const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;  
    const tokenExpiry = decoded.exp - now;

    if (tokenExpiry < 300) { // Less than 5 minutes
      console.log("Token expiring soon, consider refreshing");
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.lastLogin) {
      const sessionStartTime = new Date(decoded.iat * 1000);
      if (user.lastLogin < sessionStartTime) {
        return res.status(401).json({ message: "Session invalid" });
      }
    }

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

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};