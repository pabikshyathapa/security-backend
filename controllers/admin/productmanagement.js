const Product = require('../../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const filepath = req.file?.path;

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      categoryId: req.body.categoryId,
      sellerId: req.body.sellerId,
      description: req.body.description || "",
      stock: req.body.stock || 0,
      filepath,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created',
      data: product,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all products (paginated)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("sellerId", "name email")
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Product.countDocuments();

    return res.json({
      success: true,
      data: products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId')
      .populate('sellerId');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const filepath = req.file?.path;

    const data = {
      name: req.body.name,
      price: req.body.price,
      categoryId: req.body.categoryId,
      sellerId: req.body.sellerId,
      description: req.body.description || "",
      stock: req.body.stock || 0,
    };

    if (filepath) {
      data.filepath = filepath;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      data: product,
      message: 'Product updated',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
