const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Wishlist = require('../models/wishlist');
const wishlistController = require('../controllers/wishlistController');

const app = express();
app.use(express.json());

// Routes exactly as your backend defines
app.post('/api/wishlist/add', wishlistController.addToWishlist);
app.get('/api/wishlist/all', wishlistController.getAllWishlists);
app.get('/api/wishlist/:userId', wishlistController.getWishlist);
app.post('/api/wishlist/remove', wishlistController.removeFromWishlist);

describe('Wishlist API', () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb-wishlist', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Wishlist.deleteMany({ userId });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should add a product to the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist/add')
      .send({
        userId,
        productId,
        name: 'Diamond Necklace',
        price: 500,
        filepath: 'necklace.jpg'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Wishlist updated');
    expect(res.body.data.userId).toBe(String(userId));
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].name).toBe('Diamond Necklace');
  });

  it('should not add duplicate product to the wishlist', async () => {
    await Wishlist.create({
      userId,
      products: [{ productId, name: 'Diamond Necklace', price: 500, filepath: 'necklace.jpg' }]
    });

    const res = await request(app)
      .post('/api/wishlist/add')
      .send({
        userId,
        productId,
        name: 'Diamond Necklace',
        price: 500,
        filepath: 'necklace.jpg'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(1); // no duplicate
  });

  it('should get wishlist for a specific user', async () => {
    await Wishlist.create({
      userId,
      products: [{ productId, name: 'Ring', price: 150, filepath: 'ring.jpg' }]
    });

    const res = await request(app).get(`/api/wishlist/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(String(userId));
    expect(res.body.data.products.length).toBe(1);
  });

  it('should return 404 if wishlist for user does not exist', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/wishlist/${fakeUserId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Wishlist not found');
  });

  it('should remove a product from the wishlist', async () => {
    await Wishlist.create({
      userId,
      products: [
        { productId, name: 'Bracelet', price: 120, filepath: 'bracelet.jpg' }
      ]
    });

    const res = await request(app)
      .post('/api/wishlist/remove')
      .send({ userId, productId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Product removed');
    expect(res.body.data.products.length).toBe(0);
  });

  it('should return 404 when removing product from non-existent wishlist', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/wishlist/remove')
      .send({ userId: fakeUserId, productId });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Wishlist not found');
  });

  it('should get all wishlists', async () => {
    await Wishlist.create({
      userId,
      products: [{ productId, name: 'Gold Chain', price: 200, filepath: 'chain.jpg' }]
    });

    const res = await request(app).get('/api/wishlist/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
  it('should add multiple different products to the wishlist', async () => {
  const anotherProductId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/wishlist/add')
    .send({
      userId,
      productId,
      name: 'Ring',
      price: 150,
      filepath: 'ring.jpg'
    });

  const res = await request(app)
    .post('/api/wishlist/add')
    .send({
      userId,
      productId: anotherProductId,
      name: 'Earrings',
      price: 180,
      filepath: 'earrings.jpg'
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.products.length).toBe(2);
});
it('should get multiple wishlists for different users', async () => {
  const secondUserId = new mongoose.Types.ObjectId();
  await Wishlist.create({
    userId,
    products: [{ productId, name: 'Pendant', price: 100, filepath: 'pendant.jpg' }]
  });
  await Wishlist.create({
    userId: secondUserId,
    products: [{ productId: new mongoose.Types.ObjectId(), name: 'Brooch', price: 80, filepath: 'brooch.jpg' }]
  });

  const res = await request(app).get('/api/wishlist/all');

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.length).toBeGreaterThanOrEqual(2);
});
it('should return empty product list if wishlist created without products', async () => {
  await Wishlist.create({ userId, products: [] });

  const res = await request(app).get(`/api/wishlist/${userId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.products.length).toBe(0);
});
it('should not add duplicates when adding the same product concurrently', async () => {
  const addProductPayload = {
    userId,
    productId,
    name: 'Bracelet',
    price: 250,
    filepath: 'bracelet.jpg'
  };

  // Send two add requests concurrently
  const [res1, res2] = await Promise.all([
    request(app).post('/api/wishlist/add').send(addProductPayload),
    request(app).post('/api/wishlist/add').send(addProductPayload)
  ]);

  expect(res1.statusCode).toBe(200);
  expect(res2.statusCode).toBe(200);

  expect(res1.body.data.products.length).toBe(1);
  expect(res2.body.data.products.length).toBe(1);
});

});

