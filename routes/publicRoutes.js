const express = require('express')
const router = express.Router()
const { getAllUserProducts } = require('../controllers/publicProductController')
const Product = require('../models/Product') 


router.get('/products', getAllUserProducts)

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId')
      .populate('sellerId')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ data: product })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message })
  }
})

module.exports = router
