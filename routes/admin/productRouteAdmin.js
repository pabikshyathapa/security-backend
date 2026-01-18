// const express = require('express');
// const router = express.Router();

// const productController = require('../../controllers/admin/productmanagement'); // Your product controller
// const upload = require('../../middlewares/fileuplaod'); // Reuse the same upload middleware

// // Create a new product
// router.post(
//   '/',
//   upload.single('image'), // form field name must be "image"
//   productController.createProduct
// );

// // Get all products
// router.get('/', productController.getAllProducts);

// // Get single product by ID
// router.get('/:id', productController.getProductById);

// // Update a product
// router.put(
//   '/:id',
//   upload.single('image'),
//   productController.updateProduct
// );

// // Delete a product
// router.delete('/:id', productController.deleteProduct);

// module.exports = router;


const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productmanagement');
const upload = require('../../middlewares/fileuplaod');
const { authenticate, isAdmin } = require("../../middlewares/authorizedUser");

// Apply authentication and admin check to ALL routes
router.use(authenticate);
router.use(isAdmin);

// Create a new product (Admin only)
router.post(
  '/',
  upload.single('image'), // form field name must be "image"
  productController.createProduct
);

// Get all products (Admin only)
router.get('/', productController.getAllProducts);

// Get single product by ID (Admin only)
router.get('/:id', productController.getProductById);

// Update a product (Admin only)
router.put(
  '/:id',
  upload.single('image'),
  productController.updateProduct
);

// Delete a product (Admin only)
router.delete('/:id', productController.deleteProduct);

module.exports = router;