const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Order = require('../models/order');
const orderController = require('../controllers/ordercontroller');

// Setup app and routes
const app = express();
app.use(express.json());
app.post('/api/order/checkout', orderController.checkoutCart);
app.get('/api/order/:userId', orderController.getOrdersByUser);

describe('Order API', () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb-order', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Cart.deleteMany({ userId });
    await Order.deleteMany({ userId });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 400 when cart is empty during checkout', async () => {
    const res = await request(app)
      .post('/api/order/checkout')
      .send({ userId });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Cart is empty');
  });

  it('should successfully checkout and create an order', async () => {
    await Cart.create({
      userId,
      products: [
        {
          productId,
          name: 'Gold Earrings',
          price: 150,
          quantity: 2,
          filepath: 'earrings.jpg',
        },
      ],
    });

    const res = await request(app)
      .post('/api/order/checkout')
      .send({ userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Checkout successful. Order placed.');
    expect(res.body.data.totalAmount).toBe(300); // 150 * 2

    const updatedCart = await Cart.findOne({ userId });
    expect(updatedCart.products.length).toBe(0); // should be cleared
  });

  it('should fetch orders for a user', async () => {
    await Order.create({
      userId,
      products: [
        {
          productId,
          name: 'Silver Chain',
          price: 200,
          quantity: 1,
          filepath: 'chain.jpg',
        },
      ],
      totalAmount: 200,
    });

    const res = await request(app).get(`/api/order/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].totalAmount).toBe(200);
  });

  it('should return 404 if user has no orders', async () => {
    const anotherUser = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/order/${anotherUser}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No orders found for this user');
  });

  it('should calculate total amount correctly with multiple products', async () => {
    await Cart.create({
      userId,
      products: [
        {
          productId: new mongoose.Types.ObjectId(),
          name: 'Ring',
          price: 100,
          quantity: 2,
          filepath: 'ring.jpg',
        },
        {
          productId: new mongoose.Types.ObjectId(),
          name: 'Necklace',
          price: 300,
          quantity: 1,
          filepath: 'necklace.jpg',
        },
      ],
    });

    const res = await request(app)
      .post('/api/order/checkout')
      .send({ userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAmount).toBe(500); // 100*2 + 300*1
  });
  
});
