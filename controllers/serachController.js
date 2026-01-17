const Product = require("../models/Product");

exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q?.trim(); // remove extra spaces

    if (!keyword || keyword.length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Use RegExp for flexible matching
    const regex = new RegExp(keyword, "i"); // case-insensitive

    const results = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
      ],
    });

    if (results.length === 0) {
      return res.status(200).json({ message: "No matching products found", products: [] });
    }

    res.status(200).json({ products: results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
