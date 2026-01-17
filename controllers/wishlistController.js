const Wishlist = require('../models/wishlist');

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId, name, price, filepath } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [{ productId, name, price, filepath }],
      });
    } else {
      const productExists = wishlist.products.some(
        (p) => p.productId.toString() === productId
      );
      if (!productExists) {
        wishlist.products.push({ productId, name, price, filepath });
      }
    }

    await wishlist.save();
    res.status(200).json({ success: true, message: 'Wishlist updated', data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Product removed', data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAllWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.status(200).json({ success: true, data: wishlists });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
