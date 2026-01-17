require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Authentication & MFA
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Profile management (protected)
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);

//  Admin routes (RBAC protected)
const adminUserRoutes = require("./routes/admin/userRouteAdmin");
const adminCategoryRoutes = require("./routes/admin/categoryRouteAdmin");
const adminProductRoutes = require("./routes/admin/productRouteAdmin");
const adminRoutes = require("./routes/admin/AdminRoute");

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admins", adminRoutes);

// App features
const publicRoutes = require("./routes/publicRoutes");
const cartRoutes = require("./routes/cartRoute");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/oderRoute");
const searchRoutes = require("./routes/serachRoutes");

app.use("/api", publicRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/search-products", searchRoutes);


const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
