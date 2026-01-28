require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();


const allowedOrigin = "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", csrfProtection, profileRoutes);
const adminUserRoutes = require("./routes/admin/userRouteAdmin");
const adminCategoryRoutes = require("./routes/admin/categoryRouteAdmin");
const adminProductRoutes = require("./routes/admin/productRouteAdmin");
const adminRoutes = require("./routes/admin/AdminRoute");
app.use("/api/admin/users", csrfProtection, adminUserRoutes);
app.use("/api/admin/category", csrfProtection, adminCategoryRoutes);
app.use("/api/admin/product", csrfProtection, adminProductRoutes);
app.use("/api/admins", csrfProtection, adminRoutes);

const publicRoutes = require("./routes/publicRoutes");
const cartRoutes = require("./routes/cartRoute");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/oderRoute");
const searchRoutes = require("./routes/serachRoutes");

app.use("/api", publicRoutes);
app.use("/api/cart", csrfProtection, cartRoutes);
app.use("/api/wishlist", csrfProtection, wishlistRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/search-products", searchRoutes);

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports.csrfProtection = csrfProtection;