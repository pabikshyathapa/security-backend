const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categorymanagement');
const upload = require("../../middlewares/fileuplaod");
const { authenticate, isAdmin } = require("../../middlewares/authorizedUser");

// Apply authentication and admin check to ALL routes
router.use(authenticate);
router.use(isAdmin);

// Create new category (Admin only)
router.post(
    '/', 
    upload.single("image"),
    categoryController.createCategory
);

// Get all categories (Admin only)
router.get('/', categoryController.getAllCategories);

// Get single category by ID (Admin only)
router.get('/:id', categoryController.getCategoryById);

// Update category (Admin only)
router.put(
    '/:id', 
    upload.single("image"),
    categoryController.updateCategory
);

// Delete category (Admin only)
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;