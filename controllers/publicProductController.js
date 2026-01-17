const Product = require('../models/Product')

exports.getAllUserProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("sellerId", "name email")

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}


// const Product = require('../models/Product')

// exports.getPublicProducts = async (req, res) => {
//   try {
//     const products = await Product.find()
//       .populate('categoryId', 'name')
//       .populate('sellerId', 'name email')

//     res.status(200).json({
//       success: true,
//       message: "Products fetched successfully",
//       data: products,
//     })
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" })
//   }
// }
