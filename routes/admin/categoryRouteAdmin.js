const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categorymanagement');
const upload = require("../../middlewares/fileuplaod");
const { authenticate, isAdmin } = require("../../middlewares/authorizedUser");

router.use(authenticate);
router.use(isAdmin);

router.post(
    '/', 
    upload.single("image"),
    categoryController.createCategory
);

router.get('/', categoryController.getAllCategories);

router.get('/:id', categoryController.getCategoryById);

router.put(
    '/:id', 
    upload.single("image"),
    categoryController.updateCategory
);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;