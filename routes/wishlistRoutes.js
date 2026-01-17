const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getAllWishlists
} = require('../controllers/wishlistController');

router.post('/add', addToWishlist);
router.get('/all', getAllWishlists); 
router.get('/:userId', getWishlist);
router.post('/remove', removeFromWishlist);

module.exports = router;
